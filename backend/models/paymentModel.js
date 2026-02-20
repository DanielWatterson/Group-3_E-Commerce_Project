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

export const getOrderTotal = async (order_id) => {
    const [rows] = await pool.query(`
        SELECT SUM(oi.quantity * p.product_price) as total
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        WHERE oi.order_id = ?
    `, [order_id]);
    return rows[0].total;
};

export const createPayment = async (req, res) => {
    try {
        const { order_id, payment_method, payment_status } = req.body;
        
        if (!order_id || !payment_method) {
            return res.status(400).json({ error: 'Order ID and payment method are required' });
        }
        
        // Check if order exists
        const order = await getOrderById(order_id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Create payment - amount is calculated in the model
        const payment = await createPaymentModel(order_id, payment_method, payment_status);
        
        // Get the created payment
        const newPayment = await getPaymentByIdModel(payment.insertId);
        
        res.status(201).json({ 
            message: 'Payment created successfully',
            payment: newPayment
        });
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
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