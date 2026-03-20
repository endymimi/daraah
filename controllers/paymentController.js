import axios from "axios";
import Payment from "../models/paymentModel.js";

export const initializePayment = async (req, res) => {
    const { amount, email, currency = "NGN", tx_ref } = req.body;

    try {

        await Payment.create({
            tx_ref,
            email,
            amount,
            currency,
            status: "pending"
        });

        const response = await axios.post(
            "https://api.flutterwave.com/v3/payments",
            {
                tx_ref,
                amount,
                currency,
                redirect_url: "http://localhost:5173/payment-success",
                customer: { email },
                payment_options: "card, ussd, mobilemoney",
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        res.status(200).json({
            status: "success",
            link: response.data.data.link,
        });

    } catch (error) {
        res.status(500).json({ status: "error", message: "Payment initialization failed" });
    }
};


export const verifyPayment = async (req, res) => {
    const { transaction_id } = req.query;

    try {
        const response = await axios.get(
            `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                },
            }
        );

        const paymentData = response.data.data;

        if (paymentData.status === "successful") {

            await Payment.findOneAndUpdate(
                { tx_ref: paymentData.tx_ref },
                {
                    status: "successful",
                    transaction_id: paymentData.id,
                    payment_method: paymentData.payment_type,
                    flutterwave_response: paymentData
                }
            );

            return res.json({
                status: "success",
                data: paymentData
            });

        } else {

            await Payment.findOneAndUpdate(
                { tx_ref: paymentData.tx_ref },
                { status: "failed" }
            );

            return res.json({
                status: "failed",
                data: paymentData
            });
        }

    } catch (error) {
        res.status(500).json({ status: "error", message: "Payment verification failed" });
    }
};

export const handleWebhook = async (req, res) => {
  try {

    const secretHash = process.env.FLUTTERWAVE_WEBHOOK_HASH;

    const signature = req.headers["verif-hash"];

    // security check
    if (!signature || signature !== secretHash) {
      return res.status(401).end();
    }

    const payload = req.body;

    if (payload.event === "charge.completed") {

      const paymentData = payload.data;

      if (paymentData.status === "successful") {

        await Payment.findOneAndUpdate(
          { tx_ref: paymentData.tx_ref },
          {
            status: "successful",
            transaction_id: paymentData.id,
            payment_method: paymentData.payment_type,
            flutterwave_response: paymentData
          }
        );

      } else {

        await Payment.findOneAndUpdate(
          { tx_ref: paymentData.tx_ref },
          { status: "failed" }
        );

      }

    }

    res.status(200).json({ received: true });

  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
};