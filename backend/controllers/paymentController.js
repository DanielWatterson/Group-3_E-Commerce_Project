import {
    getAllPayments as getAllPaymentsModel,
    getPaymentById as getPaymentByIdModel,
    getPaymentsByOrderId as getPaymentsByOrderIdModel,
    createPayment as createPaymentModel,
    updatePaymentStatus as updatePaymentStatusModel,
    deletePayment as deletePaymentModel,
    getOrderTotal as getOrderTotalModel 
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

//  This function uses the imported getOrderTotalModel
export const createPayment = async (req, res) => {
    try {
        const { order_id, payment_method, payment_status } = req.body;
        
        if (!order_id || !payment_method) {
            return res.status(400).json({ error: 'Order ID and payment method are required' });
        }
        
        const order = await getOrderById(order_id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Calculate amount using the imported model function
        const calculatedAmount = await getOrderTotalModel(order_id);
        
        if (!calculatedAmount || calculatedAmount <= 0) {
            return res.status(400).json({ error: 'Order has no items or invalid total' });
        }
        
        // Pass calculated amount to createPaymentModel
        const payment = await createPaymentModel(
            order_id, 
            calculatedAmount, 
            payment_method, 
            payment_status || 'pending'
        );
        
        const newPayment = await getPaymentByIdModel(payment.insertId);
        
        res.status(201).json({ 
            message: 'Payment created successfully',
            amount: calculatedAmount,
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
        
        const existingPayment = await getPaymentByIdModel(id);
        if (!existingPayment) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        
        await updatePaymentStatusModel(id, payment_status);
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
        
        const existingPayment = await getPaymentByIdModel(id);
        if (!existingPayment) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        
        await deletePaymentModel(id);
        
        res.json({ message: 'Payment deleted successfully' });
    } catch (error) {
        console.error('Error deleting payment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};