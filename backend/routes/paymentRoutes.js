import express from 'express';
import {
  getAllPayments,
  getPaymentById,
  getPaymentsByOrderId,
  createPayment,
  updatePaymentStatus,
  deletePayment
} from '../controllers/paymentController.js';

const router = express.Router();

router.get('/', getAllPayments);
router.get('/:id', getPaymentById);
router.get('/order/:orderId', getPaymentsByOrderId);
router.post('/', createPayment);
router.patch('/:id', updatePaymentStatus);
router.delete('/:id', deletePayment);

// PayFast notification endpoint
router.post('/notify', (req, res) => {
  console.log('PayFast ITN received:', req.body);
  res.status(200).send('OK');
});

export default router;