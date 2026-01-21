import express from "express";
import upload  from "../middleware/multer.js";
import { createProduct, createMultipleProducts, allProducts,  getSingleProduct, updateProduct, deleteProduct } from "../controllers/productController.js";
const router = express.Router();

// create single product
router.post("/create", upload.array("images", 5), createProduct);

// insert many
router.post("/products", createMultipleProducts);

// all products
router.get("/all-products", allProducts);

// single product
router.get("/:productId", getSingleProduct);

// update product
router.put(
  "/:productId",
  upload.array("images", 5),
  updateProduct
);

// delete product
router.delete("/:productId/delete", deleteProduct);


export default router;
