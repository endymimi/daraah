import express from "express";
import {
    createOrder,
    getMyOrders,
    getOrderById,
    markOrderAsPaid,
} from "../controllers/orderController.js";

import auth from "../middleware/auth.js";
import restrict from "../middleware/isAdmin.js";

const router = express.Router();

/**
 * @route   POST /api/orders
 * @desc    Create new order
 * @access  Private (logged-in users)
 */
router.post("/create", auth, createOrder);

/**
 * @route   GET /api/orders/my-orders
 * @desc    Get logged-in user's order
 * @access  Private
 */
router.get("/my-orders", auth, getMyOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Private
 */
router.get("/:id", auth, getOrderById);

/**
 * @route   PUT /api/orders/:id/pay
 * @desc    Mark order as paid
 * @access  Private (Admin or Staff)
 */
router.put(
    "/:id/pay",
    auth,
    restrict("admin"),
    markOrderAsPaid
);

export default router;
