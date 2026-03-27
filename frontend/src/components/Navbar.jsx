import React from 'react';
import { 
    LayoutDashboard, Database, Search, FolderOpen, 
    Map, Quote, Sparkles, LogOut, User
} from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = ({ activeView, setActiveView, onLogout, currentUser }) => {
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

    return (
        <header className="w-full h-16 md:h-20 bg-[#0A0A0A] border-b border-white/5 flex items-center justify-between px-4 md:px-8 z-50 sticky top-0 shadow-2xl backdrop-blur-md">
            
            {/* Logo */}
            <div className="flex items-center gap-2 md:gap-3 cursor-pointer group shrink-0" onClick={() => setActiveView('dashboard')}>
                <div className="p-2 md:p-2.5 bg-orange-500 rounded-xl shadow-xl shadow-orange-500/20 group-hover:scale-110 transition-transform duration-500">
                    <Sparkles size={18} className="text-white fill-current" />
                </div>
                <span className="text-xl md:text-2xl font-black text-white tracking-tighter">Burfi</span>
            </div>

            {/* Top Navigation (Desktop) */}
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

            {/* User Profile */}
            <div className="flex items-center gap-2 md:gap-4 shrink-0">
                <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 bg-white/5 border border-white/10 rounded-full hover:border-orange-500/30 transition-all cursor-pointer">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white shadow-lg overflow-hidden border-2 border-orange-500/30">
                        {currentUser?.avatar 
                            ? <img src={currentUser.avatar} alt="" className="w-full h-full object-cover" />
                            : <User size={12} />
                        }
                    </div>
                    <div className="flex flex-col hidden xs:flex">
                        <span className="text-[10px] md:text-xs font-black text-white leading-none whitespace-nowrap">{currentUser?.name?.split(' ')[0] || 'User'}</span>
                        <span className="text-[8px] md:text-[9px] uppercase font-bold text-white/40 tracking-widest mt-1 text-orange-500">Free</span>
                    </div>
                </div>
                <button 
                    onClick={handleLogout}
                    title="Sign Out"
                    className="text-white/20 hover:text-red-400 transition-colors p-2"
                >
                    <LogOut size={16} />
                </button>
            </div>

        </header>
    );
};

export default Navbar;
