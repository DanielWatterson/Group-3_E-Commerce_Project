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

// ✅ FIXED: Include ALL discount fields
export const createOrder = async (
    customer_id, 
    original_total, 
    final_total, 
    discount_percent, 
    discount_amount,
    order_status = 'pending'
) => {
    const [rows] = await pool.query(
        `INSERT INTO orders 
         (customer_id, original_total, final_total, discount_percent, discount_amount, order_status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [customer_id, original_total, final_total, discount_percent, discount_amount, order_status]
    );
    return rows;
};

export const updateOrder = async (id, order_status) => {
    const [rows] = await pool.query(
        "UPDATE orders SET order_status = ? WHERE order_id = ?",
        [order_status, id]
    );
    return rows;
};

export const deleteOrder = async (id) => {
    const [rows] = await pool.query("DELETE FROM orders WHERE order_id = ?", [id]);
    return rows;
};

// Optional: Get orders with discount summary
export const getOrdersWithDiscounts = async () => {
    const [rows] = await pool.query(`
        SELECT 
            o.*,
            c.customer_name,
            CASE 
                WHEN o.discount_percent > 0 THEN 'Discounted'
                ELSE 'Full Price'
            END as discount_status
        FROM orders o
        JOIN customer c ON o.customer_id = c.customer_id
        ORDER BY o.order_date DESC
    `);
    return rows;
};