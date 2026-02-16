import { pool } from "../config/config.js";

// Get all payments
export const getAllPayments = async () => {
    const [rows] = await pool.query(`
        SELECT p.*, o.order_id, o.customer_id 
        FROM payments p
        JOIN orders o ON p.order_id = o.order_id
    `);
    return rows;
};

// Get payment by ID
export const getPaymentById = async (id) => {
    const [rows] = await pool.query(`
        SELECT p.*, o.order_id, o.customer_id 
        FROM payments p
        JOIN orders o ON p.order_id = o.order_id
        WHERE p.payment_id = ?
    `, [id]);
    return rows[0];
};

// Get payments by order ID
export const getPaymentsByOrderId = async (order_id) => {
    const [rows] = await pool.query(
        "SELECT * FROM payments WHERE order_id = ?", 
        [order_id]
    );
    return rows;
};

// Create a new payment
export const createPayment = async (order_id, amount, payment_method, payment_status = 'pending') => {
    const [rows] = await pool.query(
        "INSERT INTO payments (order_id, amount, payment_method, payment_status) VALUES (?, ?, ?, ?)",
        [order_id, amount, payment_method, payment_status]
    );
    return rows;
};

// Update payment status
export const updatePaymentStatus = async (id, payment_status) => {
    const [rows] = await pool.query(
        "UPDATE payments SET payment_status = ? WHERE payment_id = ?",
        [payment_status, id]
    );
    return rows;
};

// Delete payment
export const deletePayment = async (id) => {
    const [rows] = await pool.query("DELETE FROM payments WHERE payment_id = ?", [id]);
    return rows;
};