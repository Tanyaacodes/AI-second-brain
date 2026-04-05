import React, { useState, useRef } from 'react';
import { 
    LayoutDashboard, Database, Search, FolderOpen, 
    Map, Quote, Sparkles, LogOut, User, Camera, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

const Navbar = ({ activeView, setActiveView, onLogout, currentUser, onLogin }) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    
    const navItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'archive', icon: Database, label: 'Library' },
        { id: 'search', icon: Search, label: 'Search' },
        { id: 'collections', icon: FolderOpen, label: 'Collections' },
        { id: 'graph', icon: Map, label: 'Graph' },
        { id: 'highlights', icon: Quote, label: 'Highlights' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('burfi_token');
        localStorage.removeItem('burfi_user');
        if (onLogout) onLogout();
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('avatar', file);
        formData.append('name', currentUser.name);

        try {
            // Let Axios handle headers automatically for FormData with boundary
            const res = await api.put('/auth/profile', formData);
            if (res.data.user) {
                localStorage.setItem('burfi_user', JSON.stringify(res.data.user));
                if (onLogin) onLogin(res.data.user);
            }
        } catch (err) {
            console.error("Avatar upload failed:", err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <header className="w-full h-14 md:h-16 bg-[#0A0A0A] border-b border-white/5 flex items-center justify-between px-4 md:px-8 z-50 sticky top-0 shadow-2xl backdrop-blur-md">
            
            {/* Logo */}
            <div className="flex items-center gap-2 md:gap-3 cursor-pointer group shrink-0" onClick={() => setActiveView('dashboard')}>
                <div className="p-2 md:p-2.5 bg-orange-500 rounded-xl shadow-xl shadow-orange-500/20 group-hover:scale-110 transition-transform duration-500">
                    <Sparkles size={18} className="text-white fill-current" />
                </div>
                <span className="text-xl md:text-2xl font-black text-white tracking-tighter font-cursive">Burfi</span>
            </div>

            {/* Top Navigation */}
            <nav className="hidden lg:flex items-center gap-2">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveView(item.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 relative group ${
                            activeView === item.id 
                            ? 'text-white shadow-xl shadow-orange-500/10' 
                            : 'text-white/40 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <item.icon size={16} className={`flex-shrink-0 ${activeView === item.id ? 'text-white' : 'text-white/40 group-hover:text-white'} transition-colors duration-500`} />
                        <span className="text-xs font-black tracking-widest uppercase">{item.label}</span>
                        {activeView === item.id && (
                             <motion.div 
                                layoutId="navbar-active"
                                className="absolute inset-0 bg-orange-500 rounded-full -z-10" 
                                transition={{ type: 'spring', duration: 0.6 }}
                            />
                        )}
                    </button>
                ))}
            </nav>

            {/* Compact User Profile */}
            <div className="relative">
                <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1 pr-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all group"
                >
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white overflow-hidden border border-white/20">
                        {currentUser?.avatar 
                            ? <img src={currentUser.avatar} alt="" className="w-full h-full object-cover" />
                            : <User size={14} />
                        }
                    </div>
                    <span className="hidden sm:block text-[10px] font-black text-white px-1">{currentUser?.name?.split(' ')[0]}</span>
                </button>

                <AnimatePresence>
                    {showUserMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-3 w-64 bg-[#141414] border border-white/10 rounded-[24px] shadow-3xl overflow-hidden z-50 text-left"
                            >
                                <div className="p-6 border-b border-white/5 flex flex-col items-center text-center">
                                    <div className="relative group cursor-pointer mb-4" onClick={handleAvatarClick}>
                                        <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-white overflow-hidden border-2 border-orange-500/30">
                                            {uploading ? (
                                                <Loader2 size={24} className="animate-spin" />
                                            ) : currentUser?.avatar ? (
                                                <img src={currentUser.avatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={32} />
                                            )}
                                        </div>
                                        {!uploading && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Camera size={16} className="text-white" />
                                            </div>
                                        )}
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            className="hidden" 
                                            onChange={handleFileChange} 
                                            accept="image/*"
                                        />
                                    </div>
                                    <p className="text-sm font-black text-white">{currentUser?.name}</p>
                                    <p className="text-[10px] font-medium text-white/30">{currentUser?.email}</p>
                                </div>

                                <div className="p-2">
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 rounded-xl transition-all group"
                                    >
                                        <LogOut size={14} className="text-white/30 group-hover:text-red-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-red-500">Sign Out</span>
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
};

export default Navbar;
