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
router.post('/notify', express.raw({type: 'application/x-www-form-urlencoded'}), (req, res) => {
  console.log('PayFast ITN received:');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  
  // You need to verify the ITN here
  
  res.status(200).send('OK');
});

export default router;