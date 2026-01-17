import USER from "../models/userModel.js";
import { sendForgotPasswordMail } from "../emails/emailHandlers.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";



//sign up

export const signUp = async (req, res) => {
  const { email, password, firstName, lastName, cPassword } = req.body;
  if (!email || !password || !firstName || !lastName || !cPassword) {
    res
      .status(400)
      .json({
        success: false,
        errMsg: "all fields are required for registration",
      });
    return;
  }
  if (password !== cPassword) {
    res.status(400).json({ success: false, errMsg: "password do not match" });
    return;
  }
  if (password.length < 8) {
    res
      .status(400)
      .json({ success: false, errMsg: "min password length must be 8 chrs" });
    return;
  }

  try {
    const existingEmail = await USER.findOne({ email });
    if (existingEmail) {
      res.status(400).json({ success: false, errMsg: "Email already exists" });
      return;
    }

    const user = await USER.create({ ...req.body });
    res.status(201).json({
      success: true,
      message: "registration successful",
      user: {
        id: user._id,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });

  } catch (error) {
    res.status(500).send(error.message);
  }
};


export const signIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      res
        .status(400)
        .json({ success: false, errMsg: "all fields are required to sign in" });
      return;
    }

    //finding a registered email address

    const user = await USER.findOne({ email });
    if (!user) {
      res.status(404).json({ success: false, errMsg: "user not found" });
      return;
    }

    // comparing password and validating password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res
        .status(404)
        .json({ success: false, errMsg: "Email or Password is incorrect" });
      return;
    }
    //generating token
    const token = await user.generateToken();
    if (token) {
      res
        .status(200)
        .json({
          success: true,
          message: "signed in successfully",
          user: {
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            token,
          },
        });
      return;
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await USER.findOne({ email });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If the email exists, a reset link has been sent",
      });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL_RESET}/${resetToken}`;

    console.log("RESET URL:", resetUrl);


    await sendForgotPasswordMail({
      to: user.email,
      firstName: user.firstName,
      resetUrl,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset email sent",
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to process password reset",
    });
  }
};




//reset password ftn 
export const resetPassword = async (req, res) => {
  try {
    const { resetToken } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await USER.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });

  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Password reset failed",
    });
  }
};


// isLogged functiom
export const isLoggedIn = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer")) {
      return res.status(401).json({ success: false, errMsg: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await USER.findById(decoded.userId).select("firstName role email");
    if (!user) {
      return res.status(404).json({ success: false, errMsg: "user not found" });
    }

    res.status(200).json({
      success: true,
      user,
    });
  }
  catch (error) {
    res.status(401).json({ success: false, errMsg: "invalid token" })
  }

}