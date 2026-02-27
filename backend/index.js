import "dotenv/config";
import express from "express";
import cors from "cors";
import router from "./routes.js";
import { startNgrokTunnel, stopNgrokTunnel } from "./services/ngrokService.js";

import { getSingleCustomer } from "./models/usersDB.js";
import { comparePassword, createToken } from "./middleware/auth.js"; 
const app = express();

app.use(express.json());              // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(cors());                      // Then CORS

//debug middleware to see all requests
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  console.log('Headers:', req.headers['content-type']);
  console.log('Body:', req.body);
  next();
});

// LOGIN ROUTE
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const customer = await getSingleCustomer(email);

    if (!customer) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await comparePassword(password, customer.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = await createToken(email);
    return res.json({ message: "Login successful", token });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

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