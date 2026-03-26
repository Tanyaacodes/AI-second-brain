import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Link as LinkIcon, Sparkles, X, FileText, BrainCircuit, Check, Plus
} from 'lucide-react';

const Clipper = ({ 
    newSave, handleUrlPaste, handleSave, isSaving, isScraping, 
    setNewSave 
}) => {
    return (
        <div className="w-full max-w-4xl">
            <div className="relative bg-gradient-to-b from-[#141414] to-[#0A0A0A] border border-orange-500/20 rounded-[32px] shadow-[0_0_60px_rgba(249,115,22,0.1)] overflow-hidden transition-all duration-700">
                
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-orange-500/5 blur-[80px] rounded-full pointer-events-none" />

                <div className="relative p-8 flex flex-col gap-6 z-10">
                    
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500 rounded-xl shadow-lg shadow-orange-500/30">
                            <Sparkles size={16} className="text-white fill-current" />
                        </div>
                        <h2 className="text-[14px] font-black text-white uppercase tracking-[4px]">Save any Link, PDF, Tweet, Post</h2>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-start w-full">
                        
                        {/* LEFT COLUMN: Input & Info Box */}
                        <div className="flex flex-col gap-4 flex-1 w-full">
                            
                            {/* Smaller Paste Link Box */}
                            <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-1.5 rounded-2xl focus-within:border-orange-500 focus-within:bg-black/50 transition-all duration-500 shadow-inner">
                                <div className="flex-1 flex items-center gap-3 px-3 h-10">
                                    <LinkIcon size={16} className="text-orange-500" />
                                    <input 
                                        className="w-full bg-transparent border-none outline-none text-[13px] text-white font-bold placeholder:text-white/30"
                                        placeholder="Paste link here..."
                                        value={newSave.url}
                                        onChange={(e) => handleUrlPaste(e.target.value)}
                                        autoComplete="off"
                                    />
                                    {newSave.url.length > 0 && (
                                        <button onClick={() => setNewSave({ title: "", url: "", content: "", type: "article", tags: "", collectionName: "" })} className="text-white/20 hover:text-red-400 focus:outline-none"><X size={14} /></button>
                                    )}
                                </div>
                            </div>

                            {/* Info Box that is ALWAYS visible directly below */}
                            <div className="flex flex-col gap-4 p-5 bg-black/40 border border-white/5 rounded-[24px]">
                                <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                                    <FileText size={12} className="text-orange-500" /> Info about pasted link
                                </h3>
                                
                                {isScraping ? (
                                    <div className="flex items-center py-4 gap-3 text-orange-500 justify-center">
                                        <Sparkles className="animate-spin" size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Extracting...</span>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <input 
                                            className="w-full bg-transparent border-b border-white/10 pb-2 text-[13px] font-bold text-white outline-none focus:border-orange-500 transition-all placeholder:text-white/20"
                                            placeholder="Title will appear here..." value={newSave.title} onChange={(e) => setNewSave({...newSave, title: e.target.value})}
                                        />
                                        <textarea 
                                            className="w-full bg-white/5 border border-white/5 p-3 rounded-xl text-[11px] h-[72px] resize-none outline-none focus:border-orange-500 text-white/70 leading-relaxed custom-scrollbar placeholder:text-white/20 font-medium"
                                            placeholder="Info or Summary will appear here..."
                                            value={newSave.content}
                                            onChange={(e) => setNewSave({...newSave, content: e.target.value})}
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <input 
                                                className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-[9px] font-black text-orange-500 uppercase tracking-widest outline-none focus:border-orange-500 placeholder:text-orange-500/30"
                                                placeholder="Collection Name..." value={newSave.collectionName} onChange={(e) => setNewSave({...newSave, collectionName: e.target.value})}
                                            />
                                            <input 
                                                className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-[9px] text-white/40 tracking-widest outline-none font-bold uppercase focus:text-white placeholder:text-white/20"
                                                placeholder="Add Tags (comma separated)..." value={newSave.tags} onChange={(e) => setNewSave({...newSave, tags: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* RIGHT COLUMN: Small Save Button */}
                        <div className="shrink-0 pt-1">
                            <button 
                                onClick={handleSave} 
                                disabled={isSaving || !newSave.url}
                                className={`h-11 px-5 rounded-xl text-[10px] font-black uppercase tracking-[2px] transition-all flex items-center gap-2 whitespace-nowrap shadow-lg ${
                                    (newSave.url) 
                                    ? 'bg-orange-500 text-white hover:bg-white hover:text-black cursor-pointer shadow-orange-500/20' 
                                    : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
                                }`}
                            >
                                {isSaving ? <Sparkles className="animate-spin" size={14} /> : <Check size={14} />}
                                {isSaving ? "Saving..." : "Save to Burfi"}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Clipper;
