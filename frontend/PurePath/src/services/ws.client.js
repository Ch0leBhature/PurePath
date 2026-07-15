const WS_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(
    /^http/,
    "ws",
  ) + "/ws";

class WSClient {
  constructor() {
    this.url = WS_URL;
    this.ws = null;
    this.reconnectDelay = 1000;
    this.listeners = new Map(); // channel/type -> Set(callbacks)
    this.channelSubscriptions = new Set();
    this.pendingMessages = [];
    this.open();
  }

  open() {
    this.ws = new WebSocket(this.url);
    this.ws.addEventListener("open", () => {
      console.log("WS connected");
      this.reconnectDelay = 1000;

      for (const channel of this.channelSubscriptions) {
        this.ws.send(JSON.stringify({ type: "subscribe", channel }));
      }

      while (this.pendingMessages.length) {
        const message = this.pendingMessages.shift();
        this.ws.send(message);
      }
    });

    this.ws.addEventListener("message", (ev) => {
      try {
        const data = JSON.parse(ev.data);
        const channel = data.channel || data.channelName || null;
        if (channel && this.listeners.has(channel)) {
          for (const cb of this.listeners.get(channel)) cb(data);
        }
        if (data.type && this.listeners.has(data.type)) {
          for (const cb of this.listeners.get(data.type)) cb(data);
        }
      } catch (e) {
        console.warn("ws parse", e);
      }
    });

    this.ws.addEventListener("close", () => {
      console.log("WS closed, reconnecting");
      setTimeout(() => this.open(), this.reconnectDelay);
      this.reconnectDelay = Math.min(30000, this.reconnectDelay * 1.5);
    });
  }

  send(obj) {
    const payload = JSON.stringify(obj);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(payload);
      return;
    }

    this.pendingMessages.push(payload);
  }

  subscribeChannel(channel, cb) {
    if (!this.listeners.has(channel)) this.listeners.set(channel, new Set());
    this.listeners.get(channel).add(cb);
    this.channelSubscriptions.add(channel);
    this.send({ type: "subscribe", channel });
  }

  unsubscribeChannel(channel, cb) {
    if (!this.listeners.has(channel)) return;
    this.listeners.get(channel).delete(cb);
    if ((this.listeners.get(channel) || new Set()).size === 0) {
      this.listeners.delete(channel);
      this.channelSubscriptions.delete(channel);
      this.send({ type: "unsubscribe", channel });
    }
  }

  on(type, cb) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(cb);
  }
}

const wsClient = new WSClient();
export default wsClient;
