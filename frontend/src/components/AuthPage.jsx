import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import api from '../api';



// We use the simple client-side token decode approach for simplicity

const AuthPage = ({ onLogin, onBack }) => {
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const endpoint = mode === 'login' ? '/login' : '/register';
            const payload = mode === 'login'
                ? { email: form.email, password: form.password }
                : { name: form.name, email: form.email, password: form.password };

            const res = await api.post(`/auth${endpoint}`, payload);
            localStorage.setItem('burfi_token', res.data.token);
            localStorage.setItem('burfi_user', JSON.stringify(res.data.user));
            onLogin(res.data.user);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        }
        setLoading(false);
    };


    return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient background */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md"
            >
                {/* Logo */}
                <div className="flex items-center gap-3 mb-10 justify-center">
                    <div className="p-3 bg-orange-500 rounded-2xl shadow-xl shadow-orange-500/30">
                        <Sparkles size={24} className="text-white fill-current" />
                    </div>
                    <span className="text-4xl font-black text-white tracking-tighter font-cursive">Burfi</span>
                </div>

                {/* Card */}
                <div className="bg-[#141414] border border-white/10 rounded-[32px] p-8 shadow-2xl shadow-black/50">
                    {/* Tab switcher */}
                    <div className="flex gap-2 bg-white/5 p-1 rounded-2xl mb-8">
                        {['login', 'register'].map(m => (
                            <button
                                key={m}
                                onClick={() => { setMode(m); setError(''); }}
                                className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 
                                    ${mode === m ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'text-white/40 hover:text-white'}`}
                            >
                                {m === 'login' ? 'Sign In' : 'Sign Up'}
                            </button>
                        ))}
                    </div>


                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AnimatePresence>
                            {mode === 'register' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <div className="relative">
                                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                                        <input
                                            type="text"
                                            placeholder="Your name"
                                            value={form.name}
                                            onChange={e => setForm({ ...form, name: e.target.value })}
                                            required={mode === 'register'}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-orange-500 transition-all"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="relative">
                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                            <input
                                type="email"
                                placeholder="Email address"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-orange-500 transition-all"
                            />
                        </div>

                        <div className="relative">
                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-3.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-orange-500 transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        {error && (
                            <p className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In to Burfi' : 'Create Account')}
                            {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>
                </div>

                <div className="flex flex-col items-center gap-6 mt-8">
                    <button 
                        onClick={onBack}
                        className="text-white/20 hover:text-white text-[10px] uppercase font-black tracking-[4px] transition-all"
                    >
                        ← Back to Home
                    </button>
                    <p className="text-center text-white/20 text-[10px] font-black uppercase tracking-widest">
                        Your second brain. Privately yours.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthPage;
