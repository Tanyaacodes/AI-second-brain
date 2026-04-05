import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { AnimatePresence, motion } from 'framer-motion';

import Navbar from './Navbar';
import Dashboard from './Dashboard';
import Clipper from './Clipper';
import KnowledgeCard from './KnowledgeCard';
import KnowledgeGraph from './KnowledgeGraph';

import { Search, Globe, Filter, FolderPlus, Folder, Quote, ExternalLink, Play, Sparkles } from 'lucide-react';

const API_BASE = `v1/knowledge`;

const getRelativeTime = (date) => {
    const diffInDays = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
};

const Home = ({ currentUser, onLogout, onLogin }) => {
    const [items, setItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchPageQuery, setSearchPageQuery] = useState("");
    const [activeView, setActiveView] = useState("dashboard");
    const [activeFilter, setActiveFilter] = useState("all");
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    // Graph view states
    const [graphLabelsOn, setGraphLabelsOn] = useState(false);
    const [graphInteractiveOn, setGraphInteractiveOn] = useState(true);
    const [isScraping, setIsScraping] = useState(false);
    
    const [newSave, setNewSave] = useState({ title: "", url: "", content: "", type: "article", tags: "", collectionName: "" });

    const [memories, setMemories] = useState([]);
    const [collections, setCollections] = useState([]);

    const fileInputRef = useRef(null);

    const fetchItems = async () => {
        try {
            const res = await api.get(API_BASE);
            setItems(res.data.data || []);
        } catch (err) { console.error("Fetch Error:", err); }
    };

    const fetchResurface = async () => {
        try {
            const res = await api.get(`${API_BASE}/resurface`);
            setMemories(res.data.data || []);
        } catch (err) { console.error("Memory Error:", err); }
    };

    const [selectedCollection, setSelectedCollection] = useState(null);

    const fetchCollections = async () => {
        try {
            const res = await api.get(`${API_BASE}/collections`);
            setCollections(res.data.data || []);
        } catch (err) { 
            console.error("Collections Error:", err); 
            setCollections(["Uncategorized", "General", "Frontend", "UI"]);
        }
    };

    const handleRenameCollection = async (oldName, newName) => {
        try {
            await api.put(`${API_BASE}/collections/rename`, { oldName, newName });
            setCollections(prev => prev.map(c => c === oldName ? newName : c));
            setItems(prev => prev.map(it => it.collectionName === oldName ? { ...it, collectionName: newName } : it));
            if (selectedCollection === oldName) setSelectedCollection(newName);
        } catch (err) {
            console.error("Rename error:", err);
            fetchCollections();
        }
    }

    const handleDeleteCollection = async (name) => {
        try {
            await api.delete(`${API_BASE}/collections`, { data: { name } });
            setCollections(prev => prev.filter(c => c !== name));
            setItems(prev => prev.map(it => it.collectionName === name ? { ...it, collectionName: "Uncategorized" } : it));
            if (selectedCollection === name) setSelectedCollection(null);
        } catch (err) {
            console.error("Delete collection error:", err);
            fetchCollections();
        }
    }

    useEffect(() => {
        fetchItems();
        fetchResurface();
        fetchCollections();
        setSelectedCollection(null); // Reset detail view when switching main tabs
    }, [activeView]);

    const performSearch = async (val) => {
        setSearchQuery(val);
        const normalizedQuery = val.trim().toLowerCase();
        if (normalizedQuery.length > 0) {
            try {
                const res = await api.get(`${API_BASE}/search?q=${encodeURIComponent(normalizedQuery)}`);
                setItems(res.data.data || []);
            } catch (err) { console.error("Search Error:", err); }
        } else {
            fetchItems();
        }
    };

    const scrapeTimeoutRef = useRef(null);

    const handleUrlPaste = (inputUrl) => {
        const isVideo = inputUrl.includes('youtube.com') || inputUrl.includes('youtu.be');
        setNewSave(prev => ({ 
            ...prev, 
            url: inputUrl,
            type: isVideo ? 'video' : 'article'
        }));
        
        if (scrapeTimeoutRef.current) clearTimeout(scrapeTimeoutRef.current);
        
        if (inputUrl.startsWith('http') && inputUrl.length > 10) {
            scrapeTimeoutRef.current = setTimeout(async () => {
                setIsScraping(true);
                try {
                    const res = await api.get(`${API_BASE}/scrape?url=${encodeURIComponent(inputUrl)}`);
                    if (res.data.success && (res.data.data.title || res.data.data.content)) {
                        setNewSave(prev => ({ 
                            ...prev, 
                            title: res.data.data.title || prev.title, 
                            content: res.data.data.content || prev.content 
                        }));
                    }
                } catch (err) { console.error("Scrape Error:", err); }
                setIsScraping(false);
            }, 1000);
        }
    };

    const handleFileUpload = async (file) => {
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await api.post(`${API_BASE}/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            if (res.data.success) {
                setNewSave({
                    title: res.data.data.title,
                    url: res.data.data.url,
                    content: res.data.data.content,
                    type: res.data.data.type,
                    tags: res.data.data.tags.join(", "),
                    collectionName: res.data.data.collectionName
                });
            }
        } catch (err) {
            console.error("Upload Error:", err);
        } finally {
            setIsUploading(false);
        }
    }

    const handleSave = async () => {
        if (!newSave.url) return;
        setIsSaving(true);
        try {
            await api.post(`${API_BASE}/save`, newSave);
            setNewSave({ title: "", url: "", content: "", type: "article", tags: "", collectionName: "" });
            fetchItems();
            fetchResurface();
            fetchCollections();
            setActiveView('archive');
        } catch (err) { console.error("Save Error:", err); }
        setIsSaving(false);
    };

    const handleRevisit = async (id) => {
        // Optimistic update for both main list and "revisit" memories
        setItems(prev => prev.map(it => it._id === id ? {...it, revisit: !it.revisit} : it));
        setMemories(prev => {
            const isCurrentlyPinned = prev.some(it => it._id === id);
            if (isCurrentlyPinned) {
                // Was pinned -> now unpinning -> remove from memories
                return prev.filter(it => it._id !== id);
            } else {
                // Was NOT pinned -> now pinning -> find in main items and add to front
                const item = items.find(it => it._id === id);
                return item ? [{ ...item, revisit: true }, ...prev] : prev;
            }
        });

        try {
            await api.put(`${API_BASE}/${id}/revisit`);
            // Server will re-sort and finalize state
            fetchResurface();
            fetchItems();
        } catch (err) { 
            fetchItems();
            fetchResurface();
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Purge memory?")) {
            setItems(prev => prev.filter(it => it._id !== id));
            try { await api.delete(`${API_BASE}/${id}`); } catch (err) { fetchItems(); }
        }
    };

    const filteredItems = (items || []).filter(item => {
        if (activeFilter === 'all') return true;
        const isYT = item.url?.includes('youtube.com') || item.url?.includes('youtu.be');
        
        if (activeFilter === 'article') return (item.type === 'article' || item.type === 'link') && !isYT;
        if (activeFilter === 'video') return item.type === 'video' || isYT;
        
        return item.type === activeFilter;
    });

    const allUnifiedCollections = [...new Set([
        ...collections,
        ...(items || []).flatMap(it => it.tags || [])
    ])];

    // Derived Component Views
    const ClipperComponent = <Clipper 
        newSave={newSave}
        setNewSave={setNewSave}
        handleUrlPaste={handleUrlPaste}
        handleSave={handleSave}
        isSaving={isSaving}
        isScraping={isScraping}
        isUploading={isUploading}
        handleFileUpload={handleFileUpload}
    />;

    return (
        <div className="flex flex-col h-screen bg-[#0A0A0A] text-[#F9FAFB] font-sans overflow-hidden">
            <Navbar 
                activeView={activeView} 
                setActiveView={setActiveView} 
                currentUser={currentUser} 
                onLogout={onLogout} 
                onLogin={onLogin} 
            />

            <div className="flex-1 flex flex-col relative z-20 overflow-hidden">


                <div className="flex-1 overflow-y-auto custom-scrollbar-none pt-6 md:pt-10 px-4 md:px-10 pb-32">
                    <AnimatePresence mode="wait">
                        
                        {/* Phase 2: Refined Dashboard */}
                        {activeView === 'dashboard' && (
                            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <Dashboard 
                                    items={items} 
                                    memories={memories} 
                                    onDelete={handleDelete}
                                    onRevisit={handleRevisit}
                                    getRelativeTime={getRelativeTime}
                                    setActiveView={setActiveView}
                                    setActiveFilter={setActiveFilter}
                                    ClipperComponent={ClipperComponent} 
                                    currentUser={currentUser}
                                />
                            </motion.div>
                        )}

                        {/* Phase 3: Library with Filters exactly like Cortex Image 2 */}
                        {activeView === 'archive' && (
                            <motion.div key="archive" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-5xl font-black tracking-tighter text-white font-cursive">Your Library</h2>
                                    <button className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-orange-500 hover:text-white transition-all shadow-xl flex items-center gap-2">
                                        <Filter size={14} /> Sort & Filter
                                    </button>
                                </div>
                                
                                <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                                     {['all', 'article', 'tweet', 'video', 'note', 'pdf'].map(tab => (
                                        <button 
                                            key={tab}
                                            onClick={() => setActiveFilter(tab)}
                                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[2px] transition-all flex items-center gap-2 ${
                                                activeFilter === tab 
                                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                                                : 'bg-white/5 text-white/40 hover:bg-white/10 border border-white/5'
                                            }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredItems.map(item => (
                                        <KnowledgeCard key={item._id} item={item} onDelete={handleDelete} onRevisit={handleRevisit} getRelativeTime={getRelativeTime} />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                        
                        {/* Phase 4: Full Page Search like Cortex Image 3 */}
                        {activeView === 'search' && (
                            <motion.div 
                                key="search" 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                exit={{ opacity: 0 }} 
                                className="flex flex-col items-center pt-8 md:pt-16 max-w-7xl mx-auto w-full px-4"
                            >
                                {/* Professional Glow Effect */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

                                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-12 flex items-center gap-4 font-cursive">
                                    <Search size={40} className="text-orange-500" strokeWidth={3} />
                                    Search Memory
                                </h1>
                                
                                <div className="w-full max-w-3xl relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-600/20 to-orange-400/20 rounded-[48px] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                                    <Search size={22} className="absolute left-8 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-orange-500/50 transition-colors" />
                                    <input 
                                         className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-7 pl-18 pr-44 rounded-[36px] text-xl font-bold text-white outline-none focus:border-orange-500/40 focus:bg-white/[0.05] transition-all shadow-2xl placeholder:text-white/10"
                                         placeholder="Search items, tags, contents..."
                                         value={searchPageQuery}
                                         onChange={(e) => {
                                            setSearchPageQuery(e.target.value);
                                            performSearch(e.target.value);
                                         }}
                                    />
                                    <button 
                                        onClick={() => performSearch(searchPageQuery)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-orange-500 text-white px-8 py-3.5 rounded-[24px] font-black uppercase tracking-widest text-[10px] shadow-lg shadow-orange-500/20 hover:bg-white hover:text-black transition-all border-2 border-transparent"
                                    >
                                        Search
                                    </button>
                                </div>

                                <div className="mt-20 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
                                    {searchPageQuery.length > 0 && items.length === 0 && (
                                        <div className="col-span-full text-center py-20">
                                            <div className="inline-flex flex-col items-center gap-4 text-white/20">
                                                <Search size={48} strokeWidth={1} />
                                                <p className="text-sm font-black uppercase tracking-[4px]">No matches found for "{searchPageQuery}"</p>
                                            </div>
                                        </div>
                                    )}
                                    {searchPageQuery.length > 0 && items.map(item => (
                                        <KnowledgeCard key={item._id} item={item} onDelete={handleDelete} onRevisit={handleRevisit} getRelativeTime={getRelativeTime} />
                                    ))}
                                    {searchPageQuery.length === 0 && (
                                        <div className="col-span-full h-80 flex flex-col items-center justify-center bg-white/[0.01] border-2 border-dashed border-white/5 rounded-[48px] text-center px-10 transition-colors hover:bg-white/[0.02]">
                                            <div className="p-5 bg-white/5 rounded-3xl mb-6">
                                                <Globe size={32} className="text-white/10" />
                                            </div>
                                            <h3 className="text-xl font-black tracking-tight text-white/40 mb-2 uppercase">Ready to Explore</h3>
                                            <p className="text-xs font-bold text-white/10 uppercase tracking-widest max-w-xs">Enter a keyword above to scan your entire knowledge base</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                         {/* Phase 4: Full Page Collections like Cortex Image 4 */}
                         {activeView === 'collections' && (
                            <motion.div key="collections" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-16">
                                {!selectedCollection ? (
                                    <>
                                        <div className="flex items-center justify-between pb-8 border-b border-white/5">
                                            <h1 className="text-5xl font-black tracking-tighter text-white font-cursive">Collections</h1>
                                            <button 
                                                onClick={async () => {
                                                    const name = window.prompt("Enter new collection name:");
                                                    if(name) {
                                                        try {
                                                            await api.post(`${API_BASE}/collections`, { name });
                                                            setCollections(prev => [...new Set([name, ...prev])]);
                                                        } catch (err) {
                                                            console.error("Failed to create collection placeholder:", err);
                                                        }
                                                    }
                                                }}
                                                className="px-8 py-5 bg-orange-500 text-white rounded-[24px] font-black text-[12px] uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-3 shadow-xl"
                                            >
                                                <FolderPlus size={16} /> New Collection
                                            </button>
                                        </div>
                                        
                                        {allUnifiedCollections.length === 0 ? (
                                            <div className="col-span-full h-96 flex flex-col items-center justify-center bg-white/[0.02] border-2 border-dashed border-white/10 rounded-[64px] text-center space-y-6 max-w-5xl mx-auto px-10 py-20">
                                                <div className="p-6 bg-white/5 rounded-[32px]"><Folder size={32} className="text-white/20" /></div>
                                                <div>
                                                    <h3 className="text-3xl font-black tracking-tighter text-white mb-4">No collections yet</h3>
                                                    <p className="text-[12px] uppercase tracking-widest text-white/30 font-bold max-w-sm mx-auto leading-relaxed">
                                                        Start organizing your links and notes in custom folders
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                                {allUnifiedCollections.map((col, idx) => {
                                                    const colItems = (items || []).filter(it => it.collectionName === col || (col === "Uncategorized" && (!it.collectionName || it.collectionName === "Uncategorized")) || (it.tags || []).includes(col));
                                                    const collectionTags = [...new Set(colItems.flatMap(it => it.tags || []))].filter(t => t !== col).slice(0, 3);
                                                    return (
                                                        <div 
                                                            key={idx} 
                                                            onClick={() => setSelectedCollection(col)}
                                                            className="p-8 bg-[#1A1A1A] border border-white/5 rounded-[32px] relative overflow-hidden group hover:border-orange-500/30 transition-all shadow-2xl cursor-pointer flex flex-col h-full"
                                                        >
                                                            <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                                <button 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const newName = window.prompt("Rename collection:", col);
                                                                        if (newName && newName !== col) {
                                                                            handleRenameCollection(col, newName);
                                                                        }
                                                                    }}
                                                                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"
                                                                >
                                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                                </button>
                                                                <button 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if(window.confirm(`Delete ${col}? Items will be moved to Uncategorized.`)) {
                                                                            handleDeleteCollection(col);
                                                                        }
                                                                    }}
                                                                    className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-500 transition-all"
                                                                >
                                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                                </button>
                                                            </div>
                                                            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-orange-500/10 blur-[40px] rounded-full pointer-events-none group-hover:bg-orange-500/20 transition-all" />
                                                            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 text-orange-500 group-hover:scale-110 transition-transform">
                                                                <Folder size={20} className={colItems.length > 0 ? "fill-current" : ""} />
                                                            </div>
                                                            <h3 className="text-2xl font-black text-white mb-2">{col || "General"}</h3>
                                                            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">{colItems.length} Saved Items</p>
                                                            
                                                            {collectionTags.length > 0 && (
                                                                <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-white/5 relative z-10">
                                                                    {collectionTags.map(tag => (
                                                                        <span key={tag} className="px-2 py-1 bg-white/5 border border-white/10 rounded flex-shrink-0 text-[9px] font-black text-white/50 uppercase tracking-wider">{tag}</span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="space-y-10">
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-6">
                                                <button 
                                                    onClick={() => setSelectedCollection(null)}
                                                    className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white hover:text-black transition-all"
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                                                </button>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Folder size={20} className="text-orange-500 fill-current" />
                                                        <span className="text-xs font-black uppercase tracking-widest text-white/40">Collection</span>
                                                    </div>
                                                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white font-cursive">{selectedCollection}</h1>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={() => {
                                                        const newName = window.prompt("Rename collection:", selectedCollection);
                                                        if (newName && newName !== selectedCollection) {
                                                            handleRenameCollection(selectedCollection, newName);
                                                        }
                                                    }}
                                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all flex items-center gap-2 hidden md:flex"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg> Rename
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        if(window.confirm(`Delete ${selectedCollection}? Items will be moved to Uncategorized.`)) {
                                                            handleDeleteCollection(selectedCollection);
                                                        }
                                                    }}
                                                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 transition-all flex items-center gap-2"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg> <span className="hidden md:inline">Delete</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {items.filter(it => it.collectionName === selectedCollection || (it.tags || []).includes(selectedCollection)).length === 0 ? (
                                                <div className="col-span-full py-20 text-center text-white/20 font-black uppercase tracking-widest border-2 border-dashed border-white/5 rounded-[48px]">
                                                    This collection is empty.
                                                </div>
                                            ) : (
                                                items.filter(it => it.collectionName === selectedCollection || (it.tags || []).includes(selectedCollection)).map(item => (
                                                    <KnowledgeCard key={item._id} item={item} onDelete={handleDelete} onRevisit={handleRevisit} getRelativeTime={getRelativeTime} />
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                         )}

                        {activeView === 'graph' && (
                            <motion.div key="graph" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12 h-full">
                                <div className="flex items-center justify-between border-b border-white/5 pb-8">
                                    <h1 className="text-5xl font-black text-white tracking-tighter font-cursive">Dot Graph</h1>
                                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40">
                                        <div 
                                            onClick={() => setGraphLabelsOn(!graphLabelsOn)} 
                                            className={`flex items-center gap-2 px-4 py-2 cursor-pointer transition-all rounded-xl ${graphLabelsOn ? 'bg-white/10 text-white shadow-lg' : 'hover:text-white'}`}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${graphLabelsOn ? 'bg-orange-500' : 'bg-gray-500'}`}></div> Labels: {graphLabelsOn ? 'ON' : 'OFF'}
                                        </div>
                                        <div 
                                            onClick={() => setGraphInteractiveOn(!graphInteractiveOn)} 
                                            className={`flex items-center gap-2 px-4 py-2 cursor-pointer transition-all rounded-xl ${graphInteractiveOn ? 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)] text-white' : 'hover:text-white'}`}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${graphInteractiveOn ? 'bg-white' : 'bg-gray-500'}`}></div> Interactive: {graphInteractiveOn ? 'ON' : 'OFF'}
                                        </div>
                                    </div>
                                </div>
                                <div className="h-[calc(100vh-270px)] bg-[#0F0F0F] rounded-[48px] border border-white/5 relative overflow-hidden shadow-2xl">
                                    <KnowledgeGraph items={items} labelsOn={graphLabelsOn} interactiveOn={graphInteractiveOn} />
                                </div>
                            </motion.div>
                        )}

                        {activeView === 'highlights' && (
                            <motion.div 
                                key="highlights" 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                exit={{ opacity: 0 }} 
                                className="space-y-20 max-w-7xl mx-auto w-full px-4 mb-32"
                            >
                                <div className="flex flex-col gap-6 text-center pt-10">
                                    <motion.h1 
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase font-cursive"
                                    >
                                        Memory <span className="text-orange-500">Gold</span>
                                    </motion.h1>
                                    <motion.p 
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                        className="text-white/30 font-bold uppercase tracking-[10px] text-[10px] max-w-xl mx-auto leading-relaxed"
                                    >
                                        Insights, quotes, and pivotal thoughts automatically surfaced from your curated library.
                                    </motion.p>
                                </div>
                                

                                <div className="columns-1 md:columns-2 lg:columns-3 gap-10 space-y-10">
                                    {items.filter(item => (item.highlights && item.highlights.length > 0) || item.summary || item.content).map((item, i) => {
                                        const highlightList = (item.highlights && item.highlights.length > 0) 
                                            ? item.highlights 
                                            : [item.summary || (item.content ? item.content.substring(0, 180) + "..." : "")]
                                        
                                        const isYT = item.url?.includes('youtube.com') || item.url?.includes('youtu.be');
                                        const typeId = isYT ? 'video' : (item.type || 'article');
                                        
                                        const colors = {
                                            video: 'from-red-600/20 to-transparent',
                                            tweet: 'from-blue-500/20 to-transparent',
                                            pdf: 'from-orange-500/20 to-transparent',
                                            article: 'from-emerald-500/20 to-transparent',
                                            note: 'from-purple-500/20 to-transparent'
                                        };
                                        
                                        const borderColors = {
                                            video: 'border-red-500/30',
                                            tweet: 'border-blue-500/30',
                                            pdf: 'border-orange-500/30',
                                            article: 'border-emerald-500/30',
                                            note: 'border-purple-500/30'
                                        };

                                        return (
                                            <motion.div 
                                                key={i} 
                                                initial={{ opacity: 0, y: 30 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: i * 0.1 }}
                                                onClick={() => window.open(item.url, '_blank')}
                                                className="break-inside-avoid mb-24 relative group cursor-pointer flex flex-col"
                                            >
                                                {/* Type Context Header (appears on hover) */}
                                                <div className="flex items-center gap-3 mb-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/5 backdrop-blur-md ${isYT ? 'text-red-500' : 'text-orange-500'}`}>
                                                        {isYT ? <Play size={10} fill="currentColor" /> : <Sparkles size={10} />}
                                                    </span>
                                                    <span className="text-[9px] font-black uppercase tracking-[4px] text-white/40 group-hover:text-white/80 transition-colors line-clamp-1">
                                                        {item.title}
                                                    </span>
                                                </div>

                                                <div className="space-y-10 relative z-10 w-full pl-4 md:pl-8 border-l-2 border-transparent group-hover:border-orange-500/50 transition-colors duration-500">
                                                    <Quote size={120} className="absolute -top-16 -left-12 text-white/[0.02] pointer-events-none group-hover:text-orange-500/10 transition-colors duration-700 -rotate-12" />
                                                    
                                                    {highlightList.map((text, idx) => (
                                                        <div key={idx} className="relative">
                                                            <p className="text-3xl md:text-5xl font-medium leading-[1.2] text-white/40 font-serif tracking-tighter group-hover:text-white transition-all duration-500 relative z-10 group-hover:drop-shadow-[0_0_20px_rgba(249,115,22,0.3)] group-hover:italic">
                                                                "{text}"
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                                
                                                {/* Footer metadata */}
                                                <div className="flex items-center gap-4 mt-8 ml-4 md:ml-8">
                                                    <span className="w-12 h-[1px] bg-white/10 group-hover:w-24 group-hover:bg-orange-500 transition-all duration-500" />
                                                    <p className="text-[10px] font-black uppercase tracking-[4px] text-white/20 group-hover:text-orange-500 transition-colors flex items-center gap-2">
                                                        {item.source || 'Knowledge Mine'} 
                                                        <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-2 group-hover:translate-x-0" />
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                                
                                {items.length === 0 && (
                                    <div className="flex flex-col items-center py-40 gap-10 opacity-30 text-center">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-orange-500 blur-[80px] opacity-20" />
                                            <div className="p-10 bg-white/5 rounded-[40px] border border-white/10 relative z-10"><Sparkles size={64} className="text-orange-500" /></div>
                                        </div>
                                        <div className="space-y-4">
                                            <p className="text-[14px] uppercase font-black tracking-[12px] text-white">The Mine is Empty</p>
                                            <p className="text-[10px] uppercase font-bold tracking-[4px] text-white/50">Save some items to start extracting gold.</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
            {/* MOBILE BOTTOM NAVIGATION */}
            <div className="lg:hidden fixed bottom-0 left-0 w-full bg-[#0A0A0A]/90 backdrop-blur-3xl border-t border-white/5 p-2 px-4 flex items-center justify-around z-[100] pb-6">
                {[
                    { id: 'dashboard', label: 'Dash' },
                    { id: 'archive', label: 'Lib' },
                    { id: 'search', label: 'Search' },
                    { id: 'graph', label: 'Graph' },
                    { id: 'highlights', label: 'High' }
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveView(item.id)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 ${
                            activeView === item.id ? 'text-orange-500' : 'text-white/40'
                        }`}
                    >
                        <div className={`transition-transform duration-300 ${activeView === item.id ? 'scale-110' : ''}`}>
                            {item.id === 'search' && <Search size={20} />}
                            {item.id === 'dashboard' && <div className={`w-5 h-5 border-2 ${activeView === item.id ? 'border-orange-500' : 'border-white/20'} rounded-sm flex items-center justify-center`}><div className="w-2 h-2 bg-current rounded-full" /></div>}
                            {item.id === 'archive' && <div className={`w-5 h-5 border-2 ${activeView === item.id ? 'border-orange-500' : 'border-white/20'} rounded-full`} />}
                            {item.id === 'graph' && <div className={`w-5 h-5 border-2 ${activeView === item.id ? 'border-orange-500' : 'border-white/20'} rotate-45 flex items-center justify-center`}><div className="w-1 h-3 bg-current rounded-full" /></div>}
                            {item.id === 'highlights' && <div className={`w-3 h-5 border-l-4 ${activeView === item.id ? 'border-orange-500' : 'border-white/20'} italic text-2xl leading-none font-serif`}>"</div>}
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Home;
