import express from "express";
const router = express.Router();

// Import ALL customer controller functions
import { 
    getAllCustomers,
    getCustomerById, 
    getCustomerByEmail,
    checkEmailExists,
    postCustomer,
    patchCustomer,     
    deleteCustomer     
} from "./controllers/customerController.js";

// Import usersCon with aliases to avoid conflicts
import { 
    getCustomersCon, 
    postCustomerCon,
    loginCon
} from "./controllers/usersCon.js";

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

// CUSTOMER ROUTES
router.get("/customer", getAllCustomers);
router.get("/customer/id/:id", getCustomerById);
router.get("/customer/email/:email", getCustomerByEmail);
router.get("/customer/check-email", checkEmailExists);
router.post("/customer", postCustomer);
router.patch("/customer/:id", patchCustomer);    
router.delete("/customer/:id", deleteCustomer);  

// USER ROUTES (from usersCon.js)
router.get("/users-con", getCustomersCon);
router.post("/users-con", postCustomerCon);
router.post("/login", loginCon);

// PRODUCT ROUTES
router.get("/products", getAllProducts);
router.get("/products/:id", getProductById);
router.post("/products", createProduct);
router.patch("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// ORDER ROUTES
router.get("/orders", getAllOrders);
router.get("/orders/:id", getOrderById);
router.post("/orders", createOrder);
router.patch("/orders/:id", updateOrder);
router.delete("/orders/:id", deleteOrder);

// ORDER ITEM ROUTES
router.get("/orders/:id/items", getOrderItems);
router.post("/orders/:id/items", addOrderItems);
router.patch("/orders/items/:orderItemId", updateOrderItemQuantity);
router.delete("/orders/items/:orderItemId", deleteOrderItem);

// PAYMENT ROUTES
router.get("/payments", getAllPayments);
router.get("/payments/:id", getPaymentById);
router.get("/payments/orders/:orderId", getPaymentsByOrderId);
router.post("/payments", createPayment);
router.patch("/payments/:id", updatePaymentStatus);
router.delete("/payments/:id", deletePayment);

export default router;
