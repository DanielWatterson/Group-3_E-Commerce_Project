import express from "express";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});


app.listen(5050, () => {
  console.log("✅ API running on http://localhost:5050");
});

const getAllProducts = async () => {
  const [rows] = await pool.query("SELECT * FROM products;");
  return rows;
};

app.get("/products", async (req, res) => {
  const products = await getAllProducts();
  res.json(products);
});