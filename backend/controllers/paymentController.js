import {
    getAllPayments as getAllPaymentsModel,
    getPaymentById as getPaymentByIdModel,
    getPaymentsByOrderId as getPaymentsByOrderIdModel,
    createPayment as createPaymentModel,
    updatePaymentStatus as updatePaymentStatusModel,
    deletePayment as deletePaymentModel
} from "../models/paymentModel.js";

import { getOrderById } from "../models/orderModel.js";

export const getAllPayments = async (req, res) => {
    try {
        const payments = await getAllPaymentsModel();
        res.json(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await getPaymentByIdModel(id);
        
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        
        res.json(payment);
    } catch (error) {
        console.error('Error fetching payment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getPaymentsByOrderId = async (req, res) => {
    try {
        const { orderId } = req.params;
        
        // Check if order exists
        const order = await getOrderById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const payments = await getPaymentsByOrderIdModel(orderId);
        res.json(payments);
    } catch (error) {
        console.error('Error fetching order payments:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const createPayment = async (req, res) => {
    try {
        const { order_id, amount, payment_method, payment_status } = req.body;
        
        // Validation
        if (!order_id || !amount || !payment_method) {
            return res.status(400).json({ error: 'Order ID, amount, and payment method are required' });
        }
        
        // Check if order exists
        const order = await getOrderById(order_id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const payment = await createPaymentModel(order_id, amount, payment_method, payment_status || 'pending');
        
        // Get the created payment
        const newPayment = await getPaymentByIdModel(payment.insertId);
        
        res.status(201).json({ 
            message: 'Payment created successfully',
            payment: newPayment
        });
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_status } = req.body;
        
        if (!payment_status) {
            return res.status(400).json({ error: 'Payment status is required' });
        }
        
        // Check if payment exists
        const existingPayment = await getPaymentByIdModel(id);
        if (!existingPayment) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        
        const result = await updatePaymentStatusModel(id, payment_status);
        
        // Get updated payment
        const updatedPayment = await getPaymentByIdModel(id);
        
        res.json({ 
            message: 'Payment status updated successfully',
            payment: updatedPayment
        });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const deletePayment = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if payment exists
        const existingPayment = await getPaymentByIdModel(id);
        if (!existingPayment) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        
        const result = await deletePaymentModel(id);
        
        res.json({ 
            message: 'Payment deleted successfully',
            result
        });
    } catch (error) {
        console.error('Error deleting payment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};