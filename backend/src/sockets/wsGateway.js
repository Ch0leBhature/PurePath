import { WebSocketServer } from "ws";
import { redis } from "../cache/redisClient.js";

let wss;
let subClient;
let heartbeatInterval;

export async function initWebSocket(server) {
  if (wss) return; // already initialized
  wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    const { url } = request;
    if (!url.startsWith("/ws")) return socket.destroy();
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  });

  wss.on("connection", (ws) => {
    ws.isAlive = true;
    ws.subscriptions = new Set();

    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("message", (msg) => {
      try {
        const parsed = JSON.parse(msg.toString());
        if (parsed.type === "subscribe" && parsed.channel) {
          ws.subscriptions.add(parsed.channel);
        } else if (parsed.type === "unsubscribe" && parsed.channel) {
          ws.subscriptions.delete(parsed.channel);
        }
      } catch (e) {
        /* ignore */
      }
    });

    ws.on("close", () => {
      ws.subscriptions.clear();
    });
  });

  // Redis subscription for AQI channels (single subscriber)
  if (!subClient) {
    subClient = redis.duplicate();

    try {
      if (typeof subClient.setMaxListeners === "function") {
        subClient.setMaxListeners(
          Number(process.env.NODE_EVENT_MAX_LISTENERS || 20),
        );
      }

      await subClient.psubscribe("aqi:channel:*");

      subClient.on("pmessage", (pattern, channel, message) => {
        try {
          for (const client of wss.clients) {
            if (
              client.readyState === WebSocket.OPEN &&
              client.subscriptions &&
              client.subscriptions.has(channel)
            ) {
              client.send(message);
            }
          }
        } catch (e) {
          console.warn("ws broadcast error", e);
        }
      });
    } catch (e) {
      console.warn("Failed to initialize Redis subscriber for WS", e);
    }
  }

  // heartbeat
  heartbeatInterval = setInterval(() => {
    for (const client of wss.clients) {
      if (client.isAlive === false) return client.terminate();
      client.isAlive = false;
      client.ping(() => {});
    }
  }, 30000);

  wss.on("close", () => clearInterval(heartbeatInterval));

  console.log("WebSocket gateway initialized");
}

export function getWSS() {
  return wss;
}
