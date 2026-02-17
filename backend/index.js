import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes.js";
import { getCustomersCon, postCustomerCon } from "./controller/usersCon.js";
import { getSingleCustomer } from "./model/usersDB.js";
import { comparePassword, createToken } from "./middleware/auth.js";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/customer", getCustomersCon);

app.post("/customer", postCustomerCon);

app.post("/login", async (req, res) => {
  let { email, password } = req.body;
  let hashpass = await getSingleCustomer(email);
  let result = await comparePassword(password, hashpass);
  let token = await createToken(email);
  res.json({ message: "Login successful", value: result, value: token });
});
app.use(router);

app.listen(5050, () => {
  console.log("✅ API running on http://localhost:5050");
});
