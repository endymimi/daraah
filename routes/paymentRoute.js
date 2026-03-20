import express from "express";
import {
  initializePayment,
  verifyPayment,
  // handleWebhook
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/init", initializePayment);
router.get("/verify", verifyPayment);

// webhook endpoint
// router.post("/webhook", handleWebhook);

export default router;
