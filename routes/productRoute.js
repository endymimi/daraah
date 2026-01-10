import express from "express";
import { createProduct, Products, allProducts, productById, updateProduct, deleteProduct } from "../controllers/productController.js";
const router = express.Router();

// post request
router.post("/create", createProduct);
// insert many
router.post("/products", Products);

// all products
router.get("/all-products", allProducts);

// single product
router.get("/:productId", productById);

// update product
router.put("/:productId/update", updateProduct);

// delete product
router.delete("/:productId/delete", deleteProduct);


export default router;
