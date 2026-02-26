// models/paymentModel.js
import { pool } from "../config/config.js";

// ==================== GET PAYMENTS ====================

export const getAllPayments = async () => {
  const [rows] = await pool.query(`
    SELECT p.*, o.order_id, o.customer_id
    FROM payments p
    JOIN orders o ON p.order_id = o.order_id
  `);
  return rows;
};

export const getPaymentById = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT p.*, o.order_id, o.customer_id
    FROM payments p
    JOIN orders o ON p.order_id = o.order_id
    WHERE p.payment_id = ?
    `,
    [id]
  );
  return rows[0];
};

export const getPaymentsByOrderId = async (order_id) => {
  const [rows] = await pool.query(
    "SELECT * FROM payments WHERE order_id = ?", 
    [order_id]
  );
  return rows;
};

// ==================== ORDER TOTAL ====================

export const getOrderTotal = async (order_id) => {
  const [rows] = await pool.query(
    `
    SELECT SUM(oi.quantity * p.product_price) AS total
    FROM order_items oi
    JOIN products p ON oi.product_id = p.product_id
    WHERE oi.order_id = ?
    `,
    [order_id]
  );
  return rows[0]?.total || 0;
};

// ==================== CREATE PAYMENT ====================

export const createPayment = async (
  order_id,
  amount,
  payment_method = "payfast",
  payment_status = "pending"
) => {
  const [rows] = await pool.query(
    "INSERT INTO payments (order_id, amount, payment_status, payment_method) VALUES (?, ?, ?, ?)",
    [order_id, amount, payment_status, payment_method]
  );
  return rows;
};

// ==================== UPDATE PAYMENT STATUS ====================

export const updatePaymentStatus = async (id, payment_status) => {
  const [rows] = await pool.query(
    "UPDATE payments SET payment_status = ? WHERE payment_id = ?",
    [payment_status, id]
  );
  return rows;
};

// ==================== REFUND FUNCTIONS ====================

export const processRefund = async (payment_id, refund_id, refund_amount) => {
  const [rows] = await pool.query(
    `UPDATE payments 
     SET refund_id = ?, refund_amount = ?, refund_status = 'completed' 
     WHERE payment_id = ?`,
    [refund_id, refund_amount, payment_id]
  );
  return rows;
};

export const updateRefundStatus = async (payment_id, refund_status) => {
  const [rows] = await pool.query(
    "UPDATE payments SET refund_status = ? WHERE payment_id = ?",
    [refund_status, payment_id]
  );
  return rows;
};

// ==================== DELETE PAYMENT ====================

export const deletePayment = async (id) => {
  const [rows] = await pool.query("DELETE FROM payments WHERE payment_id = ?", [id]);
  return rows;
};