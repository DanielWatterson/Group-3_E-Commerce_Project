import express from "express";
import cors from "cors";
import router from "./routes.js";
import { getSingleCustomer } from "./models/usersDB.js";
import { comparePassword, createToken } from "./middleware/auth.js";
import AuditReport from './services/auditReport.js'; 

const app = express();
app.use(express.json());
app.use(cors());

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

app.use(AuditReport);
app.use(router);

app.listen(5050, () => {
  console.log("✅ API running on http://localhost:5050");
});
