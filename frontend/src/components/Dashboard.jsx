import React from 'react';
import { motion } from 'framer-motion';
import { 
    Plus, Share2, History, Database, 
    Sparkles, Link as LinkIcon, FileText, ChevronRight, Pin 
} from 'lucide-react';
import KnowledgeCard from './KnowledgeCard';

const Dashboard = ({ items, memories, onDelete, onRevisit, getRelativeTime, setActiveView, ClipperComponent, currentUser }) => {
    const stats = [
        { label: "Total Items", value: items.length || 0, icon: Database, color: "text-purple-400" },
        { label: "Links", value: items.filter(i => (i.type === 'link' || i.type === 'article') && !(i.url?.includes('youtube.com') || i.url?.includes('youtu.be'))).length || 0, icon: LinkIcon, color: "text-blue-400" },
        { label: "Videos", value: items.filter(i => i.type === 'video' || (i.url?.includes('youtube.com') || i.url?.includes('youtu.be'))).length || 0, icon: Share2, color: "text-red-400" },
        { label: "Notes", value: items.filter(i => i.type === 'note').length || 0, icon: FileText, color: "text-green-400" },
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto space-y-10 pb-20 mt-10"
        >
            {/* TOP: Date + Welcome — now above the content area */}
            <div className="px-4 flex flex-col gap-1">
                <div className="text-white/40 text-[10px] font-black uppercase tracking-[4px]">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <h1 className="text-5xl font-black text-white tracking-tighter">Welcome, {currentUser?.name?.split(' ')[0] || 'User'}</h1>
            </div>

            {/* Two-column: Clipper LEFT, Vertical Stats RIGHT */}
            <div className="flex flex-col lg:flex-row gap-8 px-4 items-start">

                {/* LEFT: Clipper */}
                <div className="flex-1 w-full">
                    <div className="w-full">
                        {ClipperComponent}
                    </div>
                </div>

                {/* RIGHT: Vertical Stats (Mobile: 2x2 Grid, Desktop: Column) */}
                <div className="w-full lg:w-60 xl:w-64 grid grid-cols-2 lg:flex lg:flex-col gap-3 shrink-0 mt-6 lg:mt-12">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 px-5 py-4 rounded-[24px] flex items-center gap-5 shadow-lg relative overflow-hidden group hover:border-orange-500/30 transition-all">
                            <div className={`p-3 bg-white/5 rounded-xl ${stat.color} group-hover:scale-110 transition-transform shrink-0`}>
                                <stat.icon size={16} />
                            </div>
                            <div className="flex flex-col">
                                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-2xl font-black text-white group-hover:text-orange-500 transition-colors">{stat.value}</p>
                            </div>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/5 group-hover:text-orange-500/10 transition-colors">
                                <stat.icon size={32} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Resurfaced Today feed exactly as in Cortex */}
            {memories.length > 0 && (
                <div className="space-y-10 px-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Pin className="text-orange-500" size={20} />
                            <h2 className="text-2xl font-black text-white uppercase tracking-wider">Pinned Items To Revisit</h2>
                             <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-white/40 uppercase tracking-widest">Memories</span>
                        </div>
                     </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        {memories.map(item => (
                            <KnowledgeCard key={item._id} item={item} onDelete={onDelete} onRevisit={onRevisit} getRelativeTime={getRelativeTime} isPinnedFeed={true} />
                        ))}
                    </div>
                </div>
            )}

            {/* Recently Saved Feed like Cortex layout */}
            <div className="space-y-10 px-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                         <History className="text-white/40" size={20} />
                        <h2 className="text-2xl font-black text-white uppercase tracking-wider">Recently Saved</h2>
                     </div>
                    <button onClick={() => setActiveView('archive')} className="text-[10px] font-black uppercase tracking-[4px] text-orange-500 hover:text-white transition-all flex items-center gap-2 group">
                        See All <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                 </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.slice(0, 8).map(item => (
                        <KnowledgeCard key={item._id} item={item} onDelete={onDelete} onRevisit={onRevisit} getRelativeTime={getRelativeTime} />
                    ))}
                </div>
            </div>

        </motion.div>
    );
};

export default Dashboard;
