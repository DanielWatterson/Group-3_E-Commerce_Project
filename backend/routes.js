import express from "express";
const router = express.Router();

import AuditReport from "./services/auditReport.js";

import {
  getAllCustomers,
  getCustomerById,
  getCustomerByEmail,
  checkEmailExists,
  postCustomer,
  patchCustomer,
  deleteCustomer,
} from "./controllers/customerController.js";

// ---------------- USER ROUTES  ----------------
import { getCustomersCon, postCustomerCon, loginCon } from "./controllers/usersCon.js";
// ---------------- PRODUCT ROUTES ----------------
import { 
    getAllProducts, 
    getProductById, 
    getProductsWithWarranty,
    createProduct, 
    updateProduct, 
    decreaseStock,    
    increaseStock,
    deleteProduct,
    restoreProduct      
} from "./controllers/productController.js";

// ---------------- ORDER ROUTES ----------------
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  previewDiscount
} from "./controllers/orderController.js";

// ---------------- ORDER ITEM ROUTES ----------------
import {
  getOrderItems,
  addOrderItems,
  updateOrderItemQuantity,
  deleteOrderItem,
} from "./controllers/orderItemController.js";

// ---------------- PAYMENT ROUTES ----------------
import {
  getAllPayments,
  getPaymentById,
  getPaymentsByOrderId,
  createPayment,
  createPayfastPayment,
  handlePayfastNotify,
  handlePayfastNotifyDebug,
  getPayfastNotifyDebugLog,
  updatePaymentStatus,
  deletePayment,
  processRefund,
  updateRefundStatus,
} from "./controllers/paymentController.js";

// ================= ROUTE DEFINITIONS =================

// ---------------- CUSTOMER ROUTES ----------------
router.get("/customer", getAllCustomers);
router.get("/customer/id/:id", getCustomerById);
router.get("/customer/email/:email", getCustomerByEmail);
router.get("/customer/check-email", checkEmailExists);
router.post("/customer", postCustomer);
router.patch("/customer/:id", patchCustomer);
router.delete("/customer/:id", deleteCustomer);

// ---------------- USER ROUTES ----------------
router.get("/users-con", getCustomersCon);
router.post("/users-con", postCustomerCon);
router.post("/login", loginCon);

// ---------------- PRODUCT ROUTES ----------------
router.get("/products", getAllProducts);
router.get("/products/:id", getProductById);
router.get("/products/warranty", getProductsWithWarranty);
router.post("/products", createProduct);
router.patch("/products/:id", updateProduct);
router.patch("/products/:id/decrease-stock", decreaseStock);
router.patch("/products/:id/increase-stock", increaseStock);
router.delete("/products/:id", deleteProduct);
router.patch("/products/:id/restore", restoreProduct);

// ---------------- ORDER ROUTES ----------------
router.get("/orders", getAllOrders);
router.get("/orders/:id", getOrderById);
router.post("/orders", createOrder);
router.patch("/orders/:id", updateOrder);
router.delete("/orders/:id", deleteOrder);
router.post("/orders/preview-discount", previewDiscount);

// ---------------- ORDER ITEM ROUTES ----------------
router.get("/orders/:id/items", getOrderItems);
router.post("/orders/:id/items", addOrderItems);
router.patch("/orders/items/:orderItemId", updateOrderItemQuantity);
router.delete("/orders/items/:orderItemId", deleteOrderItem);

// ---------------- PAYMENT ROUTES ----------------
router.get("/payments", getAllPayments);
router.get("/payments/orders/:orderId", getPaymentsByOrderId);
router.get("/payments/:id", getPaymentById);
router.post("/payments", createPayment);
router.patch("/payments/:id", updatePaymentStatus);
router.post("/payments/:id/refund", processRefund);
router.patch("/payments/:id/refund", updateRefundStatus);
router.delete("/payments/:id", deletePayment);

// PAYFAST ROUTES
router.post("/payfast/create-payment", createPayfastPayment);
router.post(
  "/payfast/notify",
  express.raw({ type: "application/x-www-form-urlencoded" }),
  handlePayfastNotify,
);
router.post(
  "/payfast/notify-debug",
  express.raw({ type: "application/x-www-form-urlencoded" }),
  handlePayfastNotifyDebug,
);
router.get("/payfast/notify-debug/log", getPayfastNotifyDebugLog);
// ================= REPORTING ROUTES =================

router.get("/reports/discount-usage", async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ error: "start and end dates are required (YYYY-MM-DD)" });
    }
    const report = await AuditReport.getDiscountUsageReport(start, end);
    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate discount report" });
  }
});

router.get("/reports/customer-analysis", async (req, res) => {
  try {
    const report = await AuditReport.getCustomerDiscountAnalysis();
    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate customer analysis" });
  }
});

router.get("/reports/product-impact", async (req, res) => {
  try {
    const report = await AuditReport.getProductDiscountImpact();
    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate product impact report" });
  }
});

router.get("/reports/discount-usage/csv", async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ error: "start and end dates required" });
    }
    const report = await AuditReport.getDiscountUsageReport(start, end);
    if (!report.daily_breakdown?.length) {
      return res.status(404).json({ message: "No data available" });
    }
    const csv = AuditReport.generateCSV(report.daily_breakdown);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=discount-report.csv");
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "CSV export failed" });
  }
});

export default router;
