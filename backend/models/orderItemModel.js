import { pool } from "../config/config.js";

export const getOrderItems = async (order_id) => {
    const [rows] = await pool.query(`
        SELECT oi.*, p.product_name, p.product_price 
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        WHERE oi.order_id = ?
    `, [order_id]);
    return rows;
};

export const addOrderItem = async (order_id, product_id, quantity) => {
    const [rows] = await pool.query(
        "INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)",
        [order_id, product_id, quantity]
    );
    return rows;
};

// Add these missing exports:
export const deleteOrderItem = async (order_item_id) => {
    const [rows] = await pool.query("DELETE FROM order_items WHERE order_item_id = ?", [order_item_id]);
    return rows;
};

export const updateOrderItemQuantity = async (order_item_id, quantity) => {
    const [rows] = await pool.query(
        "UPDATE order_items SET quantity = ? WHERE order_item_id = ?",
        [quantity, order_item_id]
    );
    return rows;
};

// Optional: Add this helper function
export const getOrderItemById = async (order_item_id) => {
    const [rows] = await pool.query(
        "SELECT * FROM order_items WHERE order_item_id = ?",
        [order_item_id]
    );
    return rows[0];
};