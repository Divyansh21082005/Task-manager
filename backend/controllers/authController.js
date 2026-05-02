import User from '../models/User.js';
import Otp from '../models/Otp.js'; 
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendEmail.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const registerUser = async (req, res) => {
    const { email } = req.body;
    
    // Safety check: Agar email frontend se na aaye toh yahi rok do
    if (!email) return res.status(400).json({ message: "Email is required" });
    
    const lowerEmail = email.toLowerCase();

    try {
        const userExists = await User.findOne({ email: lowerEmail });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        await Otp.deleteMany({ email: lowerEmail });
        await Otp.create({ email: lowerEmail, otp });

        const message = `Welcome to Task Manager!\n\nYour OTP for account verification is: ${otp}\nThis is valid for 10 minutes.`;
        
        // Email bhejna
        await sendEmail({ email: lowerEmail, subject: 'Account Verification OTP', message });

        res.status(200).json({ message: "OTP sent to your email successfully." });
    } catch (error) {
        console.error("REGISTER ERROR: ", error); // Render logs ke liye
        res.status(500).json({ message: error.message });
    }
};

export const verifyOTP = async (req, res) => {
    const { name, email, password, otp, role } = req.body; 
    
    if (!email) return res.status(400).json({ message: "Email is required" });
    const lowerEmail = email.toLowerCase();

    try {
        const otpRecord = await Otp.findOne({ email: lowerEmail, otp });
        if (!otpRecord) return res.status(400).json({ message: "Invalid or expired OTP" });

        const user = await User.create({
            name,
            email: lowerEmail,
            password,
            role: role || 'Member' 
        });

        await Otp.deleteMany({ email: lowerEmail });
        res.status(201).json({ message: "Account created successfully!" });
    } catch (error) {
        console.error("VERIFY OTP ERROR: ", error); // Render logs ke liye
        res.status(500).json({ message: error.message });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    
    if (!email) return res.status(400).json({ message: "Email is required" });
    const lowerEmail = email.toLowerCase();

    try {
        const user = await User.findOne({ email: lowerEmail });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        console.error("LOGIN ERROR: ", error); // Render logs ke liye
        res.status(500).json({ message: error.message });
    }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    
    if (!email) return res.status(400).json({ message: "Email is required" });
    const lowerEmail = email.toLowerCase();

    try {
        const user = await User.findOne({ email: lowerEmail });
        if (!user) return res.status(404).json({ message: "User not found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        await Otp.deleteMany({ email: lowerEmail });
        await Otp.create({ email: lowerEmail, otp });

        const message = `You requested a password reset.\n\nYour OTP is: ${otp}\nThis is valid for 10 minutes.`;
        await sendEmail({ email: lowerEmail, subject: 'Password Reset OTP', message });

        res.status(200).json({ message: "OTP sent to your email" });
    } catch (error) {
        console.error("FORGOT PASSWORD ERROR: ", error); // Render logs ke liye
        res.status(500).json({ message: error.message });
    }
};

export const resetPassword = async (req, res) => {
    const { email, otp, newPassword, confirmNewPassword } = req.body;
    
    if (!email) return res.status(400).json({ message: "Email is required" });
    const lowerEmail = email.toLowerCase();

    if (newPassword !== confirmNewPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    try {
        const otpRecord = await Otp.findOne({ email: lowerEmail, otp });
        if (!otpRecord) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        const user = await User.findOne({ email: lowerEmail });
        if (!user) return res.status(404).json({ message: "User not found" });

        user.password = newPassword; 
        await user.save(); 

        await Otp.deleteMany({ email: lowerEmail });

        res.status(200).json({ message: "Password reset successful. You can now login with your new password." });
    } catch (error) {
        console.error("RESET PASSWORD ERROR: ", error); // Render logs ke liye
        res.status(500).json({ message: error.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('name email role');
        res.json(users);
    } catch (error) {
        console.error("GET USERS ERROR: ", error);
        res.status(500).json({ message: error.message });
    }
};

// Admin ke liye: User ko delete karna
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "User removed successfully" });
    } catch (error) {
        console.error("DELETE USER ERROR: ", error);
        res.status(500).json({ message: error.message });
    }
};

// Admin ke liye: User ka role change karna
export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
        res.status(200).json(user);
    } catch (error) {
        console.error("UPDATE ROLE ERROR: ", error);
        res.status(500).json({ message: error.message });
    }
};