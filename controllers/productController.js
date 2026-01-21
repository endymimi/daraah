import PRODUCT from "../models/productModel.js";
import { v2 as cloudinary } from "cloudinary";


// ===================== CREATE SINGLE PRODUCT =====================
export const createProduct = async (req, res) => {
  try {
    const { title, description, price, category, colors, sizes, stock } = req.body;

    if (!title || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        errMsg: "Required fields missing",
      });
    }

    // ✅ Ensure images were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        errMsg: "At least one product image is required",
      });
    }

    if (req.files.length > 5) {
      return res.status(400).json({
        success: false,
        errMsg: "You can upload a maximum of 5 images",
      });
    }

    // ✅ Multer + Cloudinary gives secure URLs in file.path
    const images = req.files.map((file) => file.path);

    const product = await PRODUCT.create({
      title,
      description,
      price,
      category,
      colors: colors ? colors.split(",") : [],
      sizes: sizes ? sizes.split(",") : [],
      stock,
      images,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      errMsg: error.message,
    });
  }

};

// ===================== CREATE MULTIPLE PRODUCTS =====================
export const createMultipleProducts = async (req, res) => {
  try {
    const products = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        errMsg: "Request body must be an array of products",
      });
    }

    //  Validate each product before insert
    for (const product of products) {
      if (
        !product.title ||
        !product.description ||
        !product.price ||
        !product.category ||
        !product.images ||
        product.images.length === 0
      ) {
        return res.status(400).json({
          success: false,
          errMsg: "Each product must have title, description, price, category and images",
        });
      }

      if (product.images.length > 5) {
        return res.status(400).json({
          success: false,
          errMsg: "Each product can have a maximum of 5 images",
        });
      }
    }

    const createdProducts = await PRODUCT.insertMany(products, {
      ordered: true, // stop on first error
    });

    return res.status(201).json({
      success: true,
      message: "Products created successfully",
      count: createdProducts.length,
      products: createdProducts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      errMsg: error.message,
    });
  }
};


// ===================== GET ALL PRODUCTS =====================
export const allProducts = async (req, res) => {
  try {
    const {
      query,        // search keyword
      category,
      color,
      size,
      minPrice,
      maxPrice,
      sortBy,
      order,
      page = 1,
      limit = 12,
    } = req.query;

    const filters = {};

    //  SEARCH (title + description)
    if (query) {
      filters.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ];
    }

    //  CATEGORY FILTER
    if (category) {
      filters.category = category;
    }

    //  COLOR FILTER
    if (color) {
      filters.colors = { $in: color.split(",") };
    }

    //  SIZE FILTER
    if (size) {
      filters.sizes = { $in: size.split(",") };
    }

    //  PRICE RANGE FILTER
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = Number(minPrice);
      if (maxPrice) filters.price.$lte = Number(maxPrice);
    }

    //  SORTING
    let sort = { createdAt: -1 }; // default: newest first
    if (sortBy) {
      sort = {
        [sortBy]: order === "asc" ? 1 : -1,
      };
    }

    //  PAGINATION
    const pageNumber = Math.max(Number(page), 1);
    const pageLimit = Math.min(Number(limit), 50);
    const skip = (pageNumber - 1) * pageLimit;

    const [total, products] = await Promise.all([
      PRODUCT.countDocuments(filters),
      PRODUCT.find(filters)
        .sort(sort)
        .skip(skip)
        .limit(pageLimit),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageLimit),
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      errMsg: error.message,
    });
  }
};

// ===================== GET SINGLE PRODUCT =====================
export const getSingleProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await PRODUCT.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        errMsg: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      errMsg: error.message,
    });
  }
};


// ===================== UPDATE PRODUCT =====================
export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await PRODUCT.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        errMsg: "Product not found",
      });
    }

    const {
      title,
      description,
      price,
      category,
      colors,
      sizes,
      stock,
    } = req.body;

    // If new images are uploaded, replace old ones
    if (req.files && req.files.length > 0) {
      if (req.files.length > 5) {
        return res.status(400).json({
          success: false,
          errMsg: "You can upload a maximum of 5 images",
        });
      }

      //  Delete old Cloudinary images
      for (const img of product.images) {
        const publicId = img.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`products/${publicId}`);
      }

      product.images = req.files.map((file) => file.path);
    }

    // Update fields only if provided
    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (colors) product.colors = colors.split(",");
    if (sizes) product.sizes = sizes.split(",");
    if (stock !== undefined) product.stock = stock;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      errMsg: error.message,
    });
  }
};

// ===================== DELETE PRODUCT =====================
export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await PRODUCT.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        errMsg: "Product not found",
      });
    }

    // Delete images from Cloudinary
    for (const img of product.images) {
      const publicId = img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`products/${publicId}`);
    }

    await PRODUCT.findByIdAndDelete(productId);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      errMsg: error.message,
    });
  }
};


