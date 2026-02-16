import express from "express";
import cors from "cors";
import { getCustomersCon, postCustomerCon } from "./controller/usersCon.js";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/customer", getCustomersCon);
app.post("/customer", postCustomerCon);

app.listen(5050, () => {
  console.log("✅ API running on http://localhost:5050");
});