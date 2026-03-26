import React from 'react';
import { 
    LayoutDashboard, Database, Search, FolderOpen, 
    Map, Quote, Sparkles, LogOut, User
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ activeView, setActiveView }) => {
    const navItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'archive', icon: Database, label: 'Library' },
        { id: 'search', icon: Search, label: 'Search' },
        { id: 'collections', icon: FolderOpen, label: 'Collections' },
        { id: 'graph', icon: Map, label: 'Map' },
        { id: 'highlights', icon: Quote, label: 'Highlights' },
    ];

    return (
        <aside className="w-72 bg-[#0A0A0A] border-r border-white/5 flex flex-col py-10 px-6 gap-12 z-20 sticky top-0 h-screen transition-all duration-700 shadow-[20px_0_50px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-4 px-2 cursor-pointer group" onClick={() => setActiveView('dashboard')}>
                <div className="p-3 bg-orange-500 rounded-2xl shadow-2xl shadow-orange-500/20 group-hover:scale-110 transition-transform duration-500">
                    <Sparkles size={24} className="text-white fill-current" />
                </div>
                <div>
                    <span className="text-3xl font-black text-white tracking-tighter">Burfi</span>
                </div>
            </div>

            <nav className="flex-1 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                <p className="text-[10px] font-black text-white/10 uppercase tracking-[4px] mb-6 px-4">Workspace</p>
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveView(item.id)}
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 relative group overflow-hidden ${
                            activeView === item.id 
                            ? 'bg-orange-500 text-white shadow-2xl shadow-orange-500/20' 
                            : 'text-white/40 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <item.icon size={18} className={`flex-shrink-0 ${activeView === item.id ? 'text-white' : 'text-white/40 group-hover:text-white'} transition-colors duration-500`} />
                        <span className="text-sm font-black tracking-tight">{item.label}</span>
                        {activeView === item.id && (
                             <motion.div 
                                layoutId="sidebar-active"
                                className="absolute inset-0 bg-orange-500 rounded-2xl -z-10" 
                                transition={{ type: 'spring', duration: 0.6 }}
                            />
                        )}
                    </button>
                ))}
            </nav>

            {/* Profile Component inspired by Cortex */}
            <div className="pt-8 border-t border-white/5">
                <div className="flex items-center justify-between p-4 bg-white/[0.04] border border-white/10 rounded-3xl group transition-all duration-500 hover:border-orange-500/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white shadow-lg overflow-hidden border-2 border-orange-500/30">
                            <User size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-white">what.everss</span>
                            <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Free Plan</span>
                        </div>
                    </div>
                    <button className="text-white/20 hover:text-red-400 transition-colors p-2">
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
