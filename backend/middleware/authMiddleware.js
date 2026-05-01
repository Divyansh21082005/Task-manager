import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// 1. Check karega ki user logged in hai (Valid Token hai)
export const protect = async (req, res, next) => {
    let token = req.headers.authorization;

    if (token && token.startsWith('Bearer')) {
        try {
            token = token.split(' ')[1]; // "Bearer <token>" se sirf token nikalna
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // User ka data req.user mein daal dena (password chhod kar)
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// 2. Check karega ki user Admin hai ya nahi
export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access Denied. Admins only.' });
    }
};