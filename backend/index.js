import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

import { getAllCustomers, getCustomerById, postCustomer, patchCustomer, deleteCustomer} from "./controllers/customerController.js";
import { getAllProducts, getProductById, createProduct, updateProduct,deleteProduct} from "./controllers/productController.js";
import { getAllOrders, getOrderById, createOrder, updateOrder, deleteOrder } from "./controllers/orderController.js";

app.listen(5050, () => {
  console.log("✅ API running on http://localhost:5050");
});

// routes folder will be functional by Monday 

// customer api routes
app.get("/customer", getAllCustomers);
app.get("/customer/:id", getCustomerById);
app.post("/customer", postCustomer);
app.patch("/customer/:id", patchCustomer); 
app.delete("/customer/:id",deleteCustomer);
// product api routes
app.get("/products",getAllProducts);
app.get("/products/:id",getProductById);
app.post("/products",createProduct);
app.patch ("/products/:id",updateProduct);
app.delete("/products/:id", deleteProduct);
// order api routes
app.get("/orders", getAllOrders);
app.get("/orders/:id", getOrderById);
app.post("/orders", createOrder);
app.patch("/orders/:id", updateOrder);
app.delete("/orders/:id", deleteOrder);