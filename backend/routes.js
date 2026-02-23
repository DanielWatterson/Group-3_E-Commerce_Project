import express from "express";
const router = express.Router();
import AuditReport from './services/auditReport.js';

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
    postCustomerCon 
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
    deleteOrder,
    previewDiscount        // 🔥 IMPORT THE NEW PREVIEW FUNCTION
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

// DISCOUNT PREVIEW ENDPOINT (BEFORE creating order)
router.post("/orders/preview-discount", previewDiscount);

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

// AUDIT & REPORTING ROUTES

router.get('/reports/discount-usage', async (req, res) => {
    try {
        const { start, end } = req.query;
        
        // Validate date inputs
        if (!start || !end) {
            return res.status(400).json({ 
                error: 'Start date and end date are required (YYYY-MM-DD)' 
            });
        }
        
        console.log('📊 Generating discount report from', start, 'to', end);
        
        // ✅ CORRECT: Call the static method, not the class
        const report = await AuditReport.getDiscountUsageReport(start, end);
        res.json(report);
        
    } catch (error) {
        console.error('❌ Discount usage report error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Customer analysis report
router.get('/reports/customer-analysis', async (req, res) => {
    try {
        console.log('📊 Generating customer analysis report');
        
        // ✅ CORRECT: Call the static method
        const report = await AuditReport.getCustomerDiscountAnalysis();
        res.json(report);
        
    } catch (error) {
        console.error('❌ Customer analysis error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Product impact report
router.get('/reports/product-impact', async (req, res) => {
    try {
        console.log('📊 Generating product impact report');
        
        // ✅ CORRECT: Call the static method
        const report = await AuditReport.getProductDiscountImpact();
        res.json(report);
        
    } catch (error) {
        console.error('❌ Product impact error:', error);
        res.status(500).json({ error: error.message });
    }
});

// CSV export
router.get('/reports/discount-usage/csv', async (req, res) => {
    try {
        const { start, end } = req.query;
        
        if (!start || !end) {
            return res.status(400).json({ 
                error: 'Start date and end date are required' 
            });
        }
        
        const report = await AuditReport.getDiscountUsageReport(start, end);
        
        if (report.daily_breakdown && report.daily_breakdown.length > 0) {
            const csv = AuditReport.generateCSV(report.daily_breakdown);
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=discount-report.csv');
            res.send(csv);
        } else {
            res.status(404).json({ message: 'No data available for CSV export' });
        }
        
    } catch (error) {
        console.error('❌ CSV export error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;