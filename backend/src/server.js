import { configDotenv } from "dotenv";
import { webcrypto } from "node:crypto";

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

configDotenv({
  path: new URL("../.env", import.meta.url).pathname,
});

const [{ app }, { default: connectDB }, { initWebSocket }, { startPublisher }] =
  await Promise.all([
    import("./app.js"),
    import("./db/index.js"),
    import("./sockets/wsGateway.js"),
    import("./workers/aqiPublisher.js"),
  ]);

connectDB()
  .then(() => {
    const server = app.listen(process.env.PORT || 5000, () => {
      console.log(`server is running on port - ${process.env.PORT || 5000}`);
    });

    initWebSocket(server).catch((e) => console.warn("ws init failed", e));

    if (process.env.START_AQI_WORKER === "true") {
      startPublisher();
    }

    server.on("error", (error) => {
      console.log("SERVER ERR: ", error);
      process.exit(1);
    });
  })
  .catch((error) => {
    console.error("MONGO DB CONNECTION ERROR !!!", error?.stack || error);
    process.exit(1);
  });
