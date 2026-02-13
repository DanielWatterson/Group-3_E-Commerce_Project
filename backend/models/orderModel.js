import { pool } from "../config/config.js";

export const getAllOrders = async () => {
    const [rows] = await pool.query(`
        SELECT o.*, c.customer_name 
        FROM orders o
        JOIN customer c ON o.customer_id = c.customer_id
    `);
    return rows;
};

export const getOrderById = async (id) => {
    const [rows] = await pool.query(`
        SELECT o.*, c.customer_name 
        FROM orders o
        JOIN customer c ON o.customer_id = c.customer_id
        WHERE o.order_id = ?
    `, [id]);
    return rows[0];
};

export const createOrder = async (customer_id, order_status = 'pending') => {
    const [rows] = await pool.query(
        "INSERT INTO orders (customer_id, order_status) VALUES (?, ?)",
        [customer_id, order_status]
    );
    return rows;
};

export const updateOrder = async (id, customer_id, order_status) => {
    const [rows] = await pool.query(
        "UPDATE orders SET customer_id = ?, order_status = ? WHERE order_id = ?",
        [customer_id, order_status, id]
    );
    return rows;
};

export const deleteOrder = async (id) => {
    const [rows] = await pool.query("DELETE FROM orders WHERE order_id = ?", [id]);
    return rows;
};

// Separate functions for order items
export const addOrderItem = async (order_id, product_id, quantity) => {
    const [rows] = await pool.query(
        "INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)",
        [order_id, product_id, quantity]
    );
    return rows;
};

export const getOrderItems = async (order_id) => {
    const [rows] = await pool.query(`
        SELECT oi.*, p.product_name, p.product_price 
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        WHERE oi.order_id = ?
    `, [order_id]);
    return rows;
};