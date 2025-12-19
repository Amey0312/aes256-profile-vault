import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import api from '../api';
import AuthLayout from '../components/AuthLayout';

// You can use any high-quality abstract or office image here
const LOGIN_IMAGE = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop";

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/login/', formData);
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Secure Access to Your Financial World."
      subtitle="Login to manage your encrypted vault and secure transactions with AES-256 protection."
      imageSrc={LOGIN_IMAGE}
    >
      <div className="mb-10">
        <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white font-bold text-xl mb-6 shadow-lg">
          S
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Welcome Back</h1>
        <p className="text-gray-500 text-lg">Please enter your details to sign in.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-2">
           <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-900 uppercase tracking-wide ml-1">Username</label>
          <div className="relative group">
            <input
              type="text"
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all duration-300 pl-12"
              placeholder="Enter your username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-900 uppercase tracking-wide ml-1">Password</label>
          <div className="relative group">
            <input
              type="password"
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all duration-300 pl-12"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
          </div>
        </div>

        <div className="flex items-center justify-between py-2">
            <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black" />
                <span className="text-sm text-gray-500">Remember me</span>
            </label>
            <a href="#" className="text-sm font-semibold text-black hover:underline">Forgot Password?</a>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-black text-white h-14 rounded-2xl font-semibold text-lg hover:bg-gray-900 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-black/10"
        >
          {loading ? <Loader2 className="animate-spin" /> : <>Sign In <ArrowRight size={20} /></>}
        </button>
      </form>

      <p className="mt-8 text-center text-gray-500">
        Don't have an account? <Link to="/register" className="font-bold text-black hover:underline">Create free account</Link>
      </p>
    </AuthLayout>
  );
};

export default Login;