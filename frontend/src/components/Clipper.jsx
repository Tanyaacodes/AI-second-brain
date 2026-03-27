import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Link as LinkIcon, Sparkles, X, FileText, Check, Tag, FolderOpen, FilePlus
} from 'lucide-react';

const Clipper = ({ 
    newSave, handleUrlPaste, handleSave, isSaving, isScraping, 
    setNewSave, handleFileUpload, isUploading
}) => {
    const fileInputRef = React.useRef(null);
    const hasUrl = newSave.url.length > 0;

    return (
        <div className="w-full max-w-4xl">
            <div className="relative bg-gradient-to-br from-[#161616] to-[#0c0c0c] border border-white/8 rounded-[28px] shadow-[0_8px_40px_rgba(0,0,0,0.6)] overflow-hidden">
                
                {/* Ambient glow */}
                <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-orange-500/6 blur-[80px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[180px] h-[180px] bg-orange-600/4 blur-[60px] rounded-full pointer-events-none" />

                <div className="relative z-10 p-7 flex flex-col gap-5">

                    {/* Header */}
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500 rounded-xl shadow-lg shadow-orange-500/30 flex-shrink-0">
                            <Sparkles size={14} className="text-white fill-current" />
                        </div>
                        <h2 className="text-[11px] font-black text-white/70 uppercase tracking-[4px]">
                            Save any Link, PDF, Tweet, Post
                        </h2>
                    </div>

                    {/* URL Input Row (full width) */}
                    <div className={`flex items-center gap-3 bg-black/40 border rounded-2xl px-4 py-3 transition-all duration-300 ${hasUrl ? 'border-orange-500/40 shadow-[0_0_16px_rgba(249,115,22,0.1)]' : 'border-white/8 focus-within:border-orange-500/40'}`}>
                        <LinkIcon size={15} className={`flex-shrink-0 transition-colors ${hasUrl ? 'text-orange-400' : 'text-white/25'}`} />
                        <input 
                            className="flex-1 bg-transparent border-none outline-none text-[13px] text-white font-semibold placeholder:text-white/25 min-w-0"
                            placeholder="Paste a link here..."
                            value={newSave.url}
                            onChange={(e) => handleUrlPaste(e.target.value)}
                            autoComplete="off"
                        />
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            style={{ display: 'none' }} 
                            accept=".pdf,image/*"
                            onChange={(e) => handleFileUpload(e.target.files[0])}
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-orange-400 transition-all flex items-center gap-1.5 group"
                            title="Upload from PC"
                        >
                            <FilePlus size={16} />
                            <span className="text-[10px] font-black uppercase tracking-tighter hidden group-hover:inline">From PC</span>
                        </button>
                        {hasUrl && (
                            <button 
                                onClick={() => setNewSave({ title: "", url: "", content: "", type: "article", tags: "", collectionName: "" })} 
                                className="text-white/20 hover:text-red-400 focus:outline-none flex-shrink-0 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Info Panel */}
                    <div className="flex flex-col gap-4 p-5 bg-black/30 border border-white/5 rounded-[20px]">
                        <div className="flex items-center gap-2">
                            <FileText size={11} className="text-orange-500" />
                            <span className="text-[9px] font-black text-white/35 uppercase tracking-[3px]">
                                Info about pasted link
                            </span>
                        </div>
                        
                        <AnimatePresence mode="wait">
                            {isScraping ? (
                                <motion.div 
                                    key="scraping"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="flex items-center gap-3 text-orange-500 py-3 justify-center"
                                >
                                    <Sparkles className="animate-spin" size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Extracting info...</span>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="form"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="flex flex-col gap-3"
                                >
                                    {/* Title */}
                                    <input 
                                        className="w-full bg-transparent border-b border-white/8 pb-2.5 text-[13px] font-bold text-white outline-none focus:border-orange-500/60 transition-colors placeholder:text-white/20"
                                        placeholder="Title will appear here..."
                                        value={newSave.title}
                                        onChange={(e) => setNewSave({...newSave, title: e.target.value})}
                                    />

                                    {/* Summary */}
                                    <textarea 
                                        className="w-full bg-white/[0.03] border border-white/5 px-4 py-3 rounded-xl text-[11px] h-[68px] resize-none outline-none focus:border-orange-500/40 text-white/60 leading-relaxed custom-scrollbar placeholder:text-white/20 font-medium transition-colors"
                                        placeholder="Info or Summary will appear here..."
                                        value={newSave.content}
                                        onChange={(e) => setNewSave({...newSave, content: e.target.value})}
                                    />

                                    {/* Collection & Tags */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex items-center gap-2 bg-white/[0.03] border border-white/8 rounded-xl px-3 py-2.5 focus-within:border-orange-500/40 transition-colors">
                                            <FolderOpen size={11} className="text-orange-500/60 flex-shrink-0" />
                                            <input 
                                                className="flex-1 bg-transparent outline-none text-[10px] font-black text-orange-400/80 uppercase tracking-wider placeholder:text-orange-500/25 min-w-0"
                                                placeholder="Collection name..."
                                                value={newSave.collectionName}
                                                onChange={(e) => setNewSave({...newSave, collectionName: e.target.value})}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 bg-white/[0.03] border border-white/8 rounded-xl px-3 py-2.5 focus-within:border-orange-500/40 transition-colors">
                                            <Tag size={11} className="text-white/30 flex-shrink-0" />
                                            <input 
                                                className="flex-1 bg-transparent outline-none text-[10px] font-bold text-white/50 uppercase tracking-wider placeholder:text-white/20 min-w-0"
                                                placeholder="Tags, comma separated..."
                                                value={newSave.tags}
                                                onChange={(e) => setNewSave({...newSave, tags: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Save Button — full width, bottom of the card */}
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving || isUploading || !hasUrl}
                        className={`w-full py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[3px] transition-all duration-300 flex items-center justify-center gap-2.5 ${
                            hasUrl && !isUploading
                            ? 'bg-orange-500 text-white hover:bg-orange-400 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 cursor-pointer' 
                            : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
                        }`}
                    >
                        {isSaving || isUploading
                            ? <><Sparkles className="animate-spin" size={13} /> {isUploading ? 'Uploading...' : 'Saving...'}</> 
                            : <><Check size={13} /> Save to Burfi</>
                        }
                    </button>

                </div>
            </div>
        </div>
    );
};

export default Clipper;
