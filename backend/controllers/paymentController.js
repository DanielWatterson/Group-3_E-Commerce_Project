// controllers/paymentController.js
import {
    getAllPayments as getAllPaymentsMod,
    getPaymentById as getPaymentByIdMod,
    getPaymentsByOrderId as getPaymentsByOrderIdMod,
    createPayment as createPaymentMod,
    updatePaymentStatus as updatePaymentStatusMod,
    processRefund as processRefundMod,
    updateRefundStatus as updateRefundStatusMod,
    deletePayment as deletePaymentMod
} from "../models/paymentModel.js";

export const getAllPayments = async (req, res) => {
    try {
        const payments = await getAllPaymentsMod();
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPaymentById = async (req, res) => {
    try {
        const payment = await getPaymentByIdMod(req.params.id);
        if (!payment) return res.status(404).json({ error: "Payment not found" });
        res.json(payment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPaymentsByOrderId = async (req, res) => {
    try {
        const payments = await getPaymentsByOrderIdMod(req.params.orderId);
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createPayment = async (req, res) => {
    try {
        const { order_id, amount, payment_method, payment_status } = req.body;
        const result = await createPaymentMod(order_id, amount, payment_method, payment_status);
        res.status(201).json({ 
            message: "Payment created", 
            payment_id: result.insertId 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updatePaymentStatus = async (req, res) => {
    try {
        await updatePaymentStatusMod(req.params.id, req.body.payment_status);
        res.json({ message: "Payment status updated" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🔥 NEW: Process refund endpoint
export const processRefund = async (req, res) => {
    try {
        const { id } = req.params;
        const { refund_id, refund_amount } = req.body;
        
        const payment = await getPaymentByIdMod(id);
        if (!payment) {
            return res.status(404).json({ error: "Payment not found" });
        }
        
        if (payment.payment_status !== 'completed') {
            return res.status(400).json({ error: "Can only refund completed payments" });
        }
        
        await processRefundMod(id, refund_id, refund_amount);
        
        res.json({ 
            message: "Refund processed successfully",
            refund: {
                payment_id: id,
                refund_id,
                refund_amount
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateRefundStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { refund_status } = req.body;
        
        await updateRefundStatusMod(id, refund_status); 
        res.json({ message: "Refund status updated" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deletePayment = async (req, res) => {
    try {
        await deletePaymentMod(req.params.id);
        res.json({ message: "Payment deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};