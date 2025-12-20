import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react'; // Import Eye/EyeOff
import api from '../api';
import AuthLayout from '../components/AuthLayout';

const Register = () => {
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    aadhaar_number: '' 
  });
  const [showPassword, setShowPassword] = useState(false); // State for toggling password view
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Basic Validation
    if(formData.aadhaar_number.length < 12) {
        setError("Aadhaar Number must be at least 12 digits.");
        setLoading(false);
        return;
    }

    try {
      await api.post('/register/', formData);
      navigate('/login');
    } catch (err) {
      // Extract detailed Django error messages
      const msg = err.response?.data 
        ? Object.values(err.response.data).flat().join(' ') 
        : 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Join the Future of Secure Banking."
      subtitle="Create your account today and experience military-grade encryption for your personal data."
      isRightAligned={true} 
    >
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Create Account</h1>
        <p className="text-gray-500 text-lg">Start your journey with SecureVault today.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
           {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Username */}
        <div className="relative group">
            <input
              type="text"
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all pl-12"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
        </div>

        {/* Email */}
        <div className="relative group">
            <input
              type="email"
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all pl-12"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
        </div>

        {/* Aadhaar (Specific Field) */}
        <div className="relative group">
            <input
              type="text"
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all pl-12"
              placeholder="Aadhaar Number (12 Digits)"
              value={formData.aadhaar_number}
              onChange={(e) => setFormData({...formData, aadhaar_number: e.target.value})}
              required
              maxLength={12}
            />
            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
        </div>

        {/* Password */}
        <div className="relative group">
            <input
              type={showPassword ? "text" : "password"} // Dynamic Type
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all pl-12 pr-12" // Added pr-12
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
            {/* Lock Icon (Left) */}
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
            
             {/* Eye Icon Button (Right) */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-black text-white h-14 rounded-2xl font-semibold text-lg hover:bg-gray-900 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 mt-4 shadow-xl shadow-black/10"
        >
          {loading ? <Loader2 className="animate-spin" /> : <>Sign Up <ArrowRight size={20} /></>}
        </button>
      </form>

      <p className="mt-8 text-center text-gray-500">
        Already have an account? <Link to="/login" className="font-bold text-black hover:underline">Log in</Link>
      </p>
    </AuthLayout>
  );
};

export default Register;