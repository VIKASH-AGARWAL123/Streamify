import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protectRoute(req, res, next) {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized:No token provided"
            });

        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized:Invalid token" });

        }
        const currentUser = await User.findById(decoded.userId).select("-password");
        if (!currentUser) {
            return res.status(401).json({ message: "Unauthorized:User not found" });
        }

        req.user = currentUser;
        next();
    } catch (error) {
        console.error("Error in protectRoute middleware", error);
        res.status(401).json({ message: "Unauthorized:Invalid token" });
        
    }
} 
