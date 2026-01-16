// middlewares/auth.middleware.js
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.js";
import { UserCredential } from "../models/userCredential.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "").trim();

    if (!token) {
      throw new ApiError(401, "Unauthorized request: Token missing");
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new ApiError(401, "Invalid or expired access token");
    }

    const user = await UserCredential.findById(decoded?._id).select("-password ");

    if (!user) {
      throw new ApiError(401, "User associated with token not found");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Authentication failed");
  }
});

export const CommonAuth = asyncHandler(async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    console.log("Token:", token);

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // Your JWT secret key

    if (decodedToken.role === "user") {
      return res.status(401).json({
        message: "Access denied because you are not eductor or admin"
      });
    }

    let user = await User.findById(decodedToken._id);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    } else if (user.role == "user") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Attach the user object to the request for use in the next middleware/handler
    req.user = user;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.errors || error.message
    });
  }
});
export const AdminAuth = asyncHandler(async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // Your JWT secret key

    if (decodedToken.role == "student" || decodedToken.role == "educator") {
      return res.status(401).json({
        message: "Access denied because you are not eductor or admin"
      });
    }

    let user = await User.findById(decodedToken._id);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    } else if (user.role == "student" || user.role == "educator") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Attach the user object to the request for use in the next middleware/handler
    req.user = user;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.errors || error.message
    });
  }
});

/**
 * UserAuth - Allows all authenticated users (students, educators, admins)
 * Used for endpoints that should be accessible to all authenticated users
 */
export const UserAuth = asyncHandler(async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1] || authHeader?.replace("Bearer ", "").trim();

    // Debug logging
    console.log("🔐 UserAuth middleware:", {
      hasAuthHeader: !!authHeader,
      authHeaderFormat: authHeader ? (authHeader.startsWith('Bearer ') ? 'Bearer format' : 'No Bearer prefix') : 'missing',
      hasToken: !!token,
      tokenLength: token?.length || 0,
      path: req.path,
      method: req.method
    });

    if (!token) {
      console.warn("❌ UserAuth: No token provided for", req.path);
      return res.status(401).json({ message: "No token provided" });
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    if (!decodedToken._id) {
      return res.status(401).json({ message: "Invalid token: missing user ID" });
    }

    // Try to find user in User model first (most common for authenticated endpoints)
    let user = await User.findById(decodedToken._id);

    // If not found in User model, try UserCredential model
    // (tokens can be created from either model depending on login endpoint)
    if (!user) {
      const userCredential = await UserCredential.findById(decodedToken._id).select("-password");
      if (userCredential) {
        // Convert UserCredential to a format compatible with User model
        // Map UserCredential fields to User model structure
        user = {
          _id: userCredential._id,
          email: userCredential.email,
          first_name: userCredential.first_name,
          last_name: userCredential.last_name,
          name: userCredential.name,
          role: userCredential.role || 'student',
          image: userCredential.image,
          // Add any other common fields you need
        };
      }
    }

    if (!user) {
      console.error("UserAuth: User not found for ID:", decodedToken._id);
      return res.status(400).json({ message: "User not found" });
    }

    // Attach the user object to the request for use in the next middleware/handler
    req.user = user;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("UserAuth error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.errors || error.message
    });
  }
});

export default { CommonAuth, verifyJWT, AdminAuth, UserAuth };
