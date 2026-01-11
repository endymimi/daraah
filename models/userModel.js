import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email already is required"],
      trim: true,
      unique: [true, "Email already in use"],
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Emaill is invalid");
        }
      },
    },
    password: {
      type: String,
      trim: true,
      minlength: [8, "min password length must be 8 chrs"],
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("password must not contain password");
        }
      },
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// hashing password
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return ; // skip hashing if not changed

  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  
});


// password comparison
userSchema.methods.comparePassword = async function (userPassword) {
  return await bcrypt.compare(userPassword, this.password);
};

//generating jwt token
userSchema.methods.generateToken = async function (params) {
  let token = jwt.sign(
    { userId: this._id, role: this.role, firstName: this.firstName },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
  return token;
};

// generating resetpassword token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins
  return resetToken;
};

const USER = mongoose.model("user", userSchema);
export default USER;
