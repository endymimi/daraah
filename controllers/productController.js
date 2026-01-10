import PRODUCT from "../models/productModel.js";

// ===================== CREATE SINGLE PRODUCT =====================
export const createProduct = async (req, res) => {
  const { title, images, description, price, category, colors, sizes, stock } = req.body;

  if (!title || !images || !description || !category || !price) {
    return res.status(400).json({ success: false, errMsg: "Required fields missing" });
  }

  try {
    const product = await PRODUCT.create({ title, images, description, price, category, colors, sizes, stock });
    return res.status(201).json({ success: true, message: "Product created successfully", product });
  } catch (error) {
    return res.status(500).json({ success: false, errMsg: error.message });
  }
};

// ===================== CREATE MULTIPLE PRODUCTS =====================
export const Products = async (req, res) => {
  try {
    const products = await PRODUCT.insertMany(req.body);
    return res.status(201).json({ success: true, message: "Products inserted successfully", products });
  } catch (error) {
    return res.status(500).json({ success: false, errMsg: error.message });
  }
};

// ===================== GET ALL PRODUCTS WITH FILTER + SEARCH + PAGINATION =====================
export const allProducts = async (req, res) => {
  try {
    let query = {};

    // 1️⃣ SEARCH
    if (req.query.query) {
      query.$or = [
        { title: { $regex: req.query.query, $options: "i" } },
        { description: { $regex: req.query.query, $options: "i" } },
        { category: { $regex: req.query.query, $options: "i" } },
      ];
    }

    // 2️⃣ FILTERS
    if (req.query.category) query.category = req.query.category;
    if (req.query.color) query.colors = { $in: req.query.color.split(",") };
    if (req.query.size) query.sizes = { $in: req.query.size.split(",") };
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }

    // 3️⃣ PAGINATION
    const page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 10;
    limit = Math.min(limit, 50); // max 50 per request
    const skip = (page - 1) * limit;

    // 4️⃣ SORTING
    let sort = {};
    if (req.query.sortBy) {
      const order = req.query.order === "desc" ? -1 : 1;
      sort[req.query.sortBy] = order; // e.g., ?sortBy=price&order=desc
    } else {
      sort = { createdAt: -1 }; // newest first by default
    }

    const total = await PRODUCT.countDocuments(query);
    const products = await PRODUCT.find(query).skip(skip).limit(limit).sort(sort);

    return res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({ success: false, errMsg: error.message });
  }
};

// ===================== GET SINGLE PRODUCT =====================
export const productById = async (req, res) => {
  try {
    const product = await PRODUCT.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ success: false, errMsg: "Product not found" });
    }
    return res.status(200).json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, errMsg: error.message });
  }
};

// ===================== UPDATE PRODUCT (OPTIONAL) =====================
export const updateProduct = async (req, res) => {
  try {
    const product = await PRODUCT.findByIdAndUpdate(req.params.productId, req.body, { new: true });
    if (!product) return res.status(404).json({ success: false, errMsg: "Product not found" });
    return res.status(200).json({ success: true, message: "Product updated", product });
  } catch (error) {
    return res.status(500).json({ success: false, errMsg: error.message });
  }
};

// ===================== DELETE PRODUCT (OPTIONAL) =====================
export const deleteProduct = async (req, res) => {
  try {
    const product = await PRODUCT.findByIdAndDelete(req.params.productId);
    if (!product) return res.status(404).json({ success: false, errMsg: "Product not found" });
    return res.status(200).json({ success: true, message: "Product deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, errMsg: error.message });
  }
};
