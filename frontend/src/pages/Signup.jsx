import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, User, KeyRound, Loader2, CheckCircle2, Circle } from 'lucide-react';
import API from '../api';

const Signup = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'Member' // Default Member
});
    const [otp, setOtp] = useState('');

    // Password Rules State
    const [passRules, setPassRules] = useState({
        length: false, upper: false, lower: false, number: false, special: false
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Agar password type ho raha hai, toh rules check karo
        if (name === 'password') {
            setPassRules({
                length: value.length >= 8,
                upper: /[A-Z]/.test(value),
                lower: /[a-z]/.test(value),
                number: /[0-9]/.test(value),
                special: /[!@#$%^&*(),.?":{}|<>]/.test(value)
            });
        }
    };

    const isPasswordStrong = Object.values(passRules).every(Boolean);

    // Step 1: Send Details for OTP
    const handleRegister = async (e) => {
        e.preventDefault();
        if (!isPasswordStrong) return toast.error("Please meet all password requirements");
        if (formData.password !== formData.confirmPassword) return toast.error("Passwords do not match");

        setLoading(true);
        try {
            const { data } = await API.post('/auth/register', { email: formData.email });
            toast.success(data.message);
            setStep(2); 
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Send EVERYTHING to create account
    const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const { data } = await API.post('/auth/verify-otp', {
            ...formData, // Isme ab name, email, password aur role sab hai
            otp
        });
        toast.success(data.message);
        navigate('/login');
    } catch (error) {
        toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
        setLoading(false);
    }
};

    const RuleItem = ({ passed, text }) => (
        <div className={`flex items-center text-xs space-x-2 transition-colors duration-300 ${passed ? 'text-green-600' : 'text-gray-400'}`}>
            {passed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
            <span>{text}</span>
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md transition-all">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        {step === 1 ? 'Create Account' : 'Verify Email'}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {step === 1 ? 'Join your team task manager today' : `Enter the OTP sent to ${formData.email}`}
                    </p>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleRegister} className="space-y-4">
                        {/* Role Selection Tabs */}
<div className="flex bg-gray-100 p-1 rounded-xl mb-6">
    <button
        type="button"
        onClick={() => setFormData({...formData, role: 'Member'})}
        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${formData.role === 'Member' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
    >
        I'm a Member
    </button>
    <button
        type="button"
        onClick={() => setFormData({...formData, role: 'Admin'})}
        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${formData.role === 'Admin' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
    >
        I'm an Admin
    </button>
</div>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input type="text" name="name" required placeholder="Full Name" onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                        </div>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input type="email" name="email" required placeholder="Email Address" onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input type="password" name="password" required placeholder="Password" onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                        </div>

                        {/* Password Strength UI */}
                        <div className="bg-gray-50 p-3 rounded-lg grid grid-cols-2 gap-2 mt-1 mb-2 border border-gray-100">
                            <RuleItem passed={passRules.length} text="Min 8 characters" />
                            <RuleItem passed={passRules.upper} text="1 Uppercase letter" />
                            <RuleItem passed={passRules.lower} text="1 Lowercase letter" />
                            <RuleItem passed={passRules.number} text="1 Number" />
                            <RuleItem passed={passRules.special} text="1 Special character (!@#...)" />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input type="password" name="confirmPassword" required placeholder="Retype Password" onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                        </div>

                        <button type="submit" disabled={loading}
                            className={`w-full text-white font-semibold py-3 rounded-lg transition-all flex justify-center items-center ${isPasswordStrong ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}>
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Continue'}
                        </button>
                        <p className="text-center text-gray-600 text-sm">
                            Already have an account? <Link to="/login" className="text-blue-600 hover:underline font-medium">Log in</Link>
                        </p>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-5">
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input type="text" required placeholder="Enter 6-digit OTP" maxLength="6"
                                value={otp || ''} onChange={(e) => setOtp(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 text-center tracking-[0.5em] font-bold border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-all flex justify-center items-center">
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Verify & Create Account'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Signup;