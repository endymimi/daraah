import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
{
    tx_ref: {
        type: String,
        required: true,
        unique: true
    },

    transaction_id: {
        type: String
    },

    email: {
        type: String,
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    currency: {
        type: String,
        default: "NGN"
    },

    status: {
        type: String,
        enum: ["pending", "successful", "failed"],
        default: "pending"
    },

    payment_method: {
        type: String
    },

    flutterwave_response: {
        type: Object
    }

},
{ timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);