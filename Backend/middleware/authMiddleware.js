import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
            req.user = await User.findById(decoded.id).select("-password");
            next();
        } catch (error) {
            return res.status(401).json({ success: false, message: "Not authorized, token failed" });
        }
    } else {
        return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }
};

export const optionalProtect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
            req.user = await User.findById(decoded.id).select("-password");
            return next();
        } catch (error) {
            return next();
        }
    } else {
        return next();
    }
};
