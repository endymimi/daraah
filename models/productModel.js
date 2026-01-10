import mongoose from "mongoose";
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "title is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "description is required"],
    },

    images: {
      type: [String], // ✅ array of image URLs
      required: true,
      validate: {
        validator: function (value) {
          return value.length > 0 && value.length <= 5;
        },
        message: "Product must have between 1 and 5 images",
      },
    },

    category: {
      type: String,
      required: true,
      enum: ["intimate", "bags", "giftpackages", "clothings"],
    },

    price: {
      type: Number,
      required: true,
    },

    colors: {
      type: [String], // e.g. ["beige", "black", "olive"]
      default: [],
    },

    sizes: {
      type: [String], // e.g. ["XS", "S", "M", "L", "XL"]
      default: [],
    },

    stock: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// export the model
const PRODUCT = mongoose.model("Product", productSchema);
export default PRODUCT;