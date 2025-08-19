import { Router } from "express";
import { getBooking, sendEmailReceipt, downloadReceipt } from '../controller/afterPaymentController.js';

const afterPaymentRouter = Router();


// Download receipt
afterPaymentRouter.get('/:orderId/download-receipt', downloadReceipt);

// Email receipt
afterPaymentRouter.post('/:orderId/email-receipt', sendEmailReceipt);

// Get booking details
afterPaymentRouter.get('/:orderId', getBooking);

export default afterPaymentRouter;