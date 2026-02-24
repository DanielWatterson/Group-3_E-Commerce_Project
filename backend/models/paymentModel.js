// models/paymentModel.js
import { pool } from "../config/config.js";

export const getAllPayments = async () => {
    const [rows] = await pool.query("SELECT * FROM payments");
    return rows;
};

export const getPaymentById = async (id) => {
    const [rows] = await pool.query("SELECT * FROM payments WHERE payment_id = ?", [id]);
    return rows[0];
};

export const getPaymentsByOrderId = async (orderId) => {
    const [rows] = await pool.query("SELECT * FROM payments WHERE order_id = ?", [orderId]);
    return rows;
};

export const createPayment = async (order_id, amount, payment_method, payment_status = 'pending') => {
    const [rows] = await pool.query(
        `INSERT INTO payments (order_id, amount, payment_method, payment_status) 
         VALUES (?, ?, ?, ?)`,
        [order_id, amount, payment_method, payment_status]
    );
    return rows;
};

// 🔥 NEW: Process refund
export const processRefund = async (payment_id, refund_id, refund_amount) => {
    const [rows] = await pool.query(
        `UPDATE payments 
         SET refund_id = ?, refund_amount = ?, refund_status = 'completed' 
         WHERE payment_id = ?`,
        [refund_id, refund_amount, payment_id]
    );
    return rows;
};

// 🔥 NEW: Update refund status
export const updateRefundStatus = async (payment_id, refund_status) => {
    const [rows] = await pool.query(
        "UPDATE payments SET refund_status = ? WHERE payment_id = ?",
        [refund_status, payment_id]
    );
    return rows;
};

export const updatePaymentStatus = async (id, payment_status) => {
    const [rows] = await pool.query(
        "UPDATE payments SET payment_status = ? WHERE payment_id = ?",
        [payment_status, id]
    );
    return rows;
};

export const deletePayment = async (id) => {
    const [rows] = await pool.query("DELETE FROM payments WHERE payment_id = ?", [id]);
    return rows;
};