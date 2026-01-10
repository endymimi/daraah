import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, errMsg: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info (no more role)
    req.user = {
      userId: payload.userId,
      fullName: payload.fullName,
      email: payload.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({ success: false, errMsg: "Auth failed" });
  }
};

export default auth;