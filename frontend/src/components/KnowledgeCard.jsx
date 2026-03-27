import React from 'react';
import { motion } from 'framer-motion';
import { 
    Link as LinkIcon, FileText, BrainCircuit, Trash2, ExternalLink, 
    Share2, Pin, History, Play
} from 'lucide-react';

const getTypeIcon = (type, size = 12) => {
    switch (type) {
        case 'article': case 'link': return <FileText size={size} />;
        case 'video': return <Play size={size} />;
        case 'concept': return <BrainCircuit size={size} />;
        default: return <LinkIcon size={size} />;
    }
}

const getYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const KnowledgeCard = ({ item, onDelete, onRevisit, getRelativeTime, isPinnedFeed }) => {
    const ytId = getYoutubeId(item.url);
    const displayImage = item.image || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#1A1A1A] border border-white/10 group p-0 rounded-[32px] transition-all duration-500 relative flex flex-col h-full overflow-hidden hover:border-orange-500/30 shadow-2xl cursor-pointer"
            onClick={() => window.open(item.url, '_blank')}
        >
            <div className="w-full h-28 md:h-32 overflow-hidden relative group-hover:h-36 transition-all duration-700">
                {displayImage ? (
                    <>
                        <img src={displayImage} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 font-sans" />
                        {ytId && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                <div className="w-12 h-12 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-xl group-hover:scale-110 group-hover:bg-red-600 transition-all duration-500">
                                    <Play size={20} className="text-white ml-1 fill-current" />
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full bg-[#0F0F0F] relative flex items-center justify-center overflow-hidden border-b border-white/5">
                        {/* Dynamic Mesh-like background */}
                        <div className="absolute top-0 left-0 w-full h-full opacity-20">
                            <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_30%_50%,#f973161a_0%,transparent_50%)] animate-pulse" />
                            <div className="absolute bottom-[-20%] right-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_70%_50%,#f973160a_0%,transparent_50%)]" />
                        </div>
                        <div className="relative p-5 bg-white/5 border border-white/10 rounded-[24px] group-hover:scale-110 group-hover:bg-orange-500/10 transition-all duration-500 shadow-xl group-hover:border-orange-500/30">
                            {getTypeIcon(item.type, 24)}
                        </div>
                    </div>
                )}
                
                {/* Cortex style: Type Badge Top Left */}
                <div className="absolute top-4 left-4 z-20">
                    <span className="px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-[2px] text-orange-500 rounded-lg shadow-xl flex items-center gap-2">
                        <span className="text-white">{getTypeIcon(ytId ? 'video' : item.type, 12)}</span> {ytId ? 'VIDEO' : (item.type || "Content")}
                    </span>
                </div>

                <button 
                    onClick={(e) => { e.stopPropagation(); onRevisit(item._id); }}
                    className={`absolute top-4 right-4 h-8 px-3 rounded-full border transition-all duration-500 shadow-2xl flex items-center justify-center gap-2 z-20 ${item.revisit ? 'bg-orange-600 border-orange-400 text-white' : 'bg-black/60 backdrop-blur-md border border-white/10 text-white/60 hover:bg-orange-600 hover:text-white hover:border-orange-400'}`}
                >
                    <Pin size={10} className={item.revisit ? 'fill-current' : ''} />
                    <span className="text-[9px] font-black uppercase tracking-widest">{item.revisit ? 'Pinned' : 'Pin'}</span>
                </button>
            </div>

            <div className="p-4 flex flex-col flex-1 relative z-10 font-sans">
                <div className="flex items-center gap-2 text-white/20 mb-3 group-hover:text-white/50 transition-colors">
                    <History size={12} className="text-orange-500/40" />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                        {isPinnedFeed ? `Pinned ${getRelativeTime(item.updatedAt || item.createdAt)}` : `Added ${getRelativeTime(item.createdAt)}`}
                    </span>
                </div>

                <h3 className="text-base font-black leading-tight mb-3 group-hover:text-white transition-colors duration-500 line-clamp-2 text-white/90">
                    {item.title}
                </h3>
                
                {item.summary && (
                    <p className="text-xs text-white/40 mb-4 line-clamp-2 leading-relaxed transition-colors duration-500 group-hover:text-white/70 font-bold">
                        {item.summary}
                    </p>
                )}

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex flex-wrap gap-2">
                        {(item.tags || []).slice(0, 2).map(tag => (
                            <span key={tag} className="text-[9px] text-white/40 font-black bg-white/5 px-2 py-1 rounded-lg border border-white/5 group-hover:border-orange-500/20 group-hover:text-orange-500 transition-colors uppercase tracking-[2px]">#{tag}</span>
                        ))}
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(item._id); }}
                            className="p-2 text-white/10 hover:text-red-400 hover:bg-white/5 rounded-xl transition-all"
                        >
                            <Trash2 size={14} />
                        </button>
                        <a 
                            href={item.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
                            className="p-2 bg-white text-black rounded-xl hover:bg-orange-500 hover:text-white transition-all transform hover:scale-105 shadow-xl shadow-orange-500/10 flex items-center justify-center w-8 h-8"
                        >
                            <ExternalLink size={14} />
                        </a>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default KnowledgeCard;
