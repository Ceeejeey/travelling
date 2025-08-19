import mongoose from "mongoose";


// Payment schema
const PaymentSchema = new mongoose.Schema({
  paymentType: { type: String, required: true, enum: ['PayHere', 'PayPal'] },
  merchant_id: { type: String },
  order_id: { type: String, required: true, unique: true },
  payment_id: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { type: String, required: true },
  md5sig: { type: String },
  customer: {
    first_name: { type: String },
    last_name: { type: String },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    country: { type: String },
    delivery_address: { type: String },
    delivery_city: { type: String },
    delivery_country: { type: String },
    tripName: { type: String },
  },
  created_at: { type: Date, default: Date.now },
});

const Payment = mongoose.models.payment || mongoose.model("payment", PaymentSchema);

export default Payment;