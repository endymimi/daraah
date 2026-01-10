import express from "express";
import { initializePayment, verifyPayment } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/payments/init", initializePayment);
router.get("/payments/verify", verifyPayment);

export default router;
