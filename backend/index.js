import "dotenv/config";
import express from "express";
import cors from "cors";
import router from "./routes.js";
import { startNgrokTunnel, stopNgrokTunnel } from "./services/ngrokService.js";

const app = express();
app.use(express.json());
app.use(cors());
app.use(router);

const PORT = Number(process.env.PORT || 5050);
let httpServer;

const bootstrap = async () => {
  try {
    await startNgrokTunnel(PORT);
  } catch (error) {
    console.error("Ngrok startup failed. Continuing without a new tunnel:", error?.message || error);
  }

  httpServer = app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
    if (process.env.BACKEND_BASE_URL) {
      console.log(`Backend public URL: ${process.env.BACKEND_BASE_URL}`);
    }
  });
};

const shutdown = async (signal) => {
  console.log(`Received ${signal}. Shutting down...`);

  try {
    await stopNgrokTunnel();

    if (httpServer) {
      await new Promise((resolve, reject) => {
        httpServer.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
    }
  } catch (error) {
    console.error("Shutdown error:", error);
  } finally {
    process.exit(0);
  }
};

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

void bootstrap();
