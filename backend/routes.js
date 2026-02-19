import express from "express";
const router = express.Router();

// Import controllers
import { 
    getCustomerById, 
    patchCustomer, 
    deleteCustomer 
} from "./controllers/customerController.js";
import { getCustomersCon, postCustomerCon } from "./controllers/usersCon.js";

import { 
    getAllProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct 
} from "./controllers/productController.js";

import { 
    getAllOrders, 
    getOrderById, 
    createOrder, 
    updateOrder, 
    deleteOrder 
} from "./controllers/orderController.js";

import { 
    getOrderItems, 
    addOrderItems, 
    updateOrderItemQuantity, 
    deleteOrderItem 
} from "./controllers/orderItemController.js";

import { 
    getAllPayments, 
    getPaymentById, 
    getPaymentsByOrderId, 
    createPayment, 
    updatePaymentStatus, 
    deletePayment 
} from "./controllers/paymentController.js";

// Customer routes
router.get("/customer", getCustomersCon);
router.get("/customer/:id", getCustomerById);
router.post("/customer", postCustomerCon);
router.patch("/customer/:id", patchCustomer);
router.delete("/customer/:id", deleteCustomer);

// Product routes
router.get("/products", getAllProducts);
router.get("/products/:id", getProductById);
router.post("/products", createProduct);
router.patch("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// Order routes
router.get("/orders", getAllOrders);
router.get("/orders/:id", getOrderById);
router.post("/orders", createOrder);
router.patch("/orders/:id", updateOrder);
router.delete("/orders/:id", deleteOrder);

// Order Item routes
router.get("/orders/:id/items", getOrderItems);
router.post("/orders/:id/items", addOrderItems);
router.patch("/orders/items/:orderItemId", updateOrderItemQuantity);
router.delete("/orders/items/:orderItemId", deleteOrderItem);

// Payment routes
router.get("/payments", getAllPayments);
router.get("/payments/:id", getPaymentById);
router.get("/payments/orders/:orderId", getPaymentsByOrderId);
router.post("/payments", createPayment);
router.patch("/payments/:id", updatePaymentStatus);
router.delete("/payments/:id", deletePayment);

export default router;
