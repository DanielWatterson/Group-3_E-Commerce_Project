import express from "express";
import cors from "cors";
import router from "./routes.js";
import { getSingleCustomer } from "./models/usersDB.js";
import { comparePassword, createToken } from "./middleware/auth.js"; 
console.log("🔍 comparePassword imported:", comparePassword ? "✅ Yes" : "❌ No");
console.log("🔍 createToken imported:", createToken ? "✅ Yes" : "❌ No");
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

app.listen(5050, () => {
  console.log("✅ API running on http://localhost:5050");
});