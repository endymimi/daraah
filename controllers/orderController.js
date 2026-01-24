import ORDER from "../models/orderModel.js";
import PRODUCT from "../models/productModel.js";

export const createOrder = async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
        } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: "No order items" });
        }

        let itemsPrice = 0;

        // Validate products & calculate total
        const formattedItems = await Promise.all(
            orderItems.map(async (item) => {
                const product = await PRODUCT.findById(item.product);

                if (!product) {
                    throw new Error("Product not found");
                }

                if (product.stock < item.quantity) {
                    throw new Error(`${product.title} is out of stock`);
                }

                itemsPrice += product.price * item.quantity;

                return {
                    product: product._id,
                    title: product.title,
                    image: product.images[0],
                    price: product.price,
                    quantity: item.quantity,
                    color: item.color,
                    size: item.size,
                };
            })
        );

        const shippingPrice = itemsPrice > 50000 ? 0 : 3000; // example logic
        const totalPrice = itemsPrice + shippingPrice;

        const order = await ORDER.create({
            user: req.user.userId,
            orderItems: formattedItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            totalPrice,
        });

        res.status(201).json({
            success: true,
            order,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyOrders = async (req, res) => {
    try {
        const orders = await ORDER.find({ user: req.user.userId })
            .sort("-createdAt");

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const order = await ORDER.findById(req.params.id)
            .populate("user", "firstName lastName email");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const markOrderAsPaid = async (req, res) => {
    try {
        const order = await ORDER.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        order.paymentStatus = "paid";
        order.paidAt = Date.now();

        await order.save();

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
