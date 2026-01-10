import axios from "axios";

export const initializePayment = async (req, res) => {
    const { amount, email, currency = "NGN", tx_ref } = req.body;

    try {
        const response = await axios.post(
            "https://api.flutterwave.com/v3/payments",
            {
                tx_ref, // unique transaction reference
                amount,
                currency,
                redirect_url: "http://localhost:3000/api/payments/verify", // after payment redirect
                customer: {
                    email,
                },
                payment_options: "card, ussd, mobilemoney",
                meta: {
                    // optional: additional info
                    customer_name: "John Doe",
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        // return payment link to client
        res.status(200).json({
            status: "success",
            link: response.data.data.link,
        });
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ status: "error", message: "Payment initialization failed" });
    }
};

export const verifyPayment = async (req, res) => {
    const { transaction_id } = req.query; // Flutterwave returns tx ID

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
            // Update your database (MongoDB) with payment info
            // e.g., mark order as paid
            res.json({ status: "success", data: paymentData });
        } else {
            res.json({ status: "failed", data: paymentData });
        }
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ status: "error", message: "Payment verification failed" });
    }
};
