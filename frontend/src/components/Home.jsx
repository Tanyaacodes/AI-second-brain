import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { AnimatePresence, motion } from 'framer-motion';

import Navbar from './Navbar';
import Dashboard from './Dashboard';
import Clipper from './Clipper';
import KnowledgeCard from './KnowledgeCard';
import KnowledgeGraph from './KnowledgeGraph';

import { Search, Globe, Filter, FolderPlus, Folder } from 'lucide-react';

const API_BASE = `/v1/knowledge`;

const getRelativeTime = (date) => {
    const diffInDays = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
};

const Home = ({ currentUser, onLogout }) => {
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
            setItems(res.data.data);
        } catch (err) { console.error("Fetch Error:", err); }
    };

    const fetchResurface = async () => {
        try {
            const res = await api.get(`${API_BASE}/resurface`);
            setMemories(res.data.data);
        } catch (err) { console.error("Memory Error:", err); }
    };

    const fetchCollections = async () => {
        try {
            const res = await api.get(`${API_BASE}/collections`);
            setCollections(res.data.data);
        } catch (err) { 
            console.error("Collections Error:", err); 
            setCollections(["Uncategorized", "General", "Frontend", "UI"]);
        }
    };

    useEffect(() => {
        fetchItems();
        fetchResurface();
        fetchCollections();
    }, []);

    const performSearch = async (val) => {
        setSearchQuery(val);
        const normalizedQuery = val.trim().toLowerCase();
        if (normalizedQuery.length > 0) {
            try {
                const res = await api.get(`${API_BASE}/search?q=${encodeURIComponent(normalizedQuery)}`);
                setItems(res.data.data);
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

    const filteredItems = items.filter(item => {
        if (activeFilter === 'all') return true;
        const isYT = item.url?.includes('youtube.com') || item.url?.includes('youtu.be');
        
        if (activeFilter === 'article') return (item.type === 'article' || item.type === 'link') && !isYT;
        if (activeFilter === 'video') return item.type === 'video' || isYT;
        
        return item.type === activeFilter;
    });

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
            <Navbar activeView={activeView} setActiveView={setActiveView} currentUser={currentUser} onLogout={onLogout} />

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
                                    ClipperComponent={ClipperComponent} 
                                    currentUser={currentUser}
                                />
                            </motion.div>
                        )}

                        {/* Phase 3: Library with Filters exactly like Cortex Image 2 */}
                        {activeView === 'archive' && (
                            <motion.div key="archive" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-5xl font-black tracking-tighter text-white">Your Library</h2>
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
                            <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col justify-start items-center pt-10 custom-scrollbar-none overflow-y-auto">
                                <h1 className="text-[54px] font-black text-white tracking-tighter mb-8 transition-all">Search Your Memory</h1>
                                <div className="w-full max-w-4xl relative">
                                    <Search size={24} className="absolute left-8 top-1/2 -translate-y-1/2 text-white/30" />
                                    <input 
                                         className="w-full bg-white/[0.03] border border-white/[0.08] p-8 pl-20 pr-48 rounded-[48px] text-2xl font-black text-white outline-none focus:border-orange-500/50 focus:bg-white/5 transition-all shadow-2xl"
                                         placeholder="Search for... 'design patterns'..."
                                         value={searchPageQuery}
                                         onChange={(e) => {
                                            setSearchPageQuery(e.target.value);
                                            performSearch(e.target.value);
                                         }}
                                    />
                                    <button 
                                        onClick={() => performSearch(searchPageQuery)}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 bg-orange-500 text-white px-5 py-2.5 rounded-[24px] font-black uppercase tracking-widest text-[9px] shadow-xl hover:bg-white hover:text-black transition-all border-2 border-transparent hover:border-orange-500"
                                    >
                                        Search Burfi
                                    </button>
                                </div>
                                <div className="mt-10 w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                                    {searchPageQuery.length > 0 && items.length === 0 && (
                                        <div className="col-span-full text-center text-white/30 font-bold py-20 uppercase tracking-widest">No results found for "{searchPageQuery}"</div>
                                    )}
                                    {searchPageQuery.length > 0 && items.map(item => (
                                        <KnowledgeCard key={item._id} item={item} onDelete={handleDelete} onRevisit={handleRevisit} getRelativeTime={getRelativeTime} />
                                    ))}
                                    {searchPageQuery.length === 0 && (
                                        <div className="col-span-full h-48 bg-white/[0.02] border-2 border-dashed border-white/10 rounded-[48px] flex items-center justify-center text-white/20 font-black tracking-widest uppercase mt-10">
                                            Start typing to search your entire knowledge base
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                         {/* Phase 4: Full Page Collections like Cortex Image 4 */}
                         {activeView === 'collections' && (
                            <motion.div key="collections" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-16">
                                <div className="flex items-center justify-between pb-8 border-b border-white/5">
                                    <h1 className="text-5xl font-black tracking-tighter text-white">Collections</h1>
                                    <button 
                                        onClick={() => {
                                            const name = window.prompt("Enter new collection name:");
                                            if(name) setCollections(prev => [...new Set([name, ...prev])]);
                                        }}
                                        className="px-8 py-5 bg-orange-500 text-white rounded-[24px] font-black text-[12px] uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-3 shadow-xl"
                                    >
                                        <FolderPlus size={16} /> New Collection
                                    </button>
                                </div>
                                
                                {collections.length === 0 ? (
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
                                        {collections.map((col, idx) => {
                                            const colItems = items.filter(it => it.collectionName === col);
                                            return (
                                                <div key={idx} className="p-8 bg-[#1A1A1A] border border-white/5 rounded-[32px] relative overflow-hidden group hover:border-orange-500/30 transition-all shadow-2xl cursor-pointer">
                                                    <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-orange-500/10 blur-[40px] rounded-full pointer-events-none group-hover:bg-orange-500/20 transition-all" />
                                                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 text-orange-500 group-hover:scale-110 transition-transform">
                                                        <Folder size={20} className={colItems.length > 0 ? "fill-current" : ""} />
                                                    </div>
                                                    <h3 className="text-2xl font-black text-white mb-2">{col || "General"}</h3>
                                                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">{colItems.length} Saved Items</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeView === 'graph' && (
                            <motion.div key="graph" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12 h-full">
                                <div className="flex items-center justify-between border-b border-white/5 pb-8">
                                    <h1 className="text-5xl font-black text-white tracking-tighter">Dot Graph</h1>
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
                            <motion.div key="highlights" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                                <div className="flex flex-col gap-2">
                                    <h1 className="text-5xl font-black text-white tracking-tighter">Highlights</h1>
                                    <p className="text-white/40 font-bold uppercase tracking-[4px] text-[10px]">The most important bits from your saved items</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                                    {items.filter(item => (item.highlights && item.highlights.length > 0) || item.summary || item.content).map((item, i) => {
                                        const highlightText = (item.highlights && item.highlights.length > 0) ? item.highlights[0] : (item.summary || (item.content ? item.content.substring(0, 150) + "..." : "No text found."));
                                        const colors = ['border-orange-500/30', 'border-blue-500/30', 'border-emerald-500/30', 'border-purple-500/30', 'border-pink-500/30'];
                                        const borderColor = colors[i % colors.length];
                                        
                                        return (
                                            <div key={i} className={`group p-8 flex flex-col justify-between gap-6 bg-[#111111] border ${borderColor} rounded-[32px] hover:bg-white/5 transition-all duration-500 shadow-xl relative overflow-hidden h-full`}>
                                                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 blur-[30px] rounded-full pointer-events-none group-hover:bg-orange-500/10 transition-all" />
                                                
                                                <p className="text-lg font-medium leading-relaxed italic text-white/90 font-serif tracking-normal opacity-90 group-hover:opacity-100 transition-opacity line-clamp-6">
                                                    "{highlightText}"
                                                </p>
                                                
                                                <div className="flex items-center gap-3 pt-6 border-t border-white/5 mt-auto">
                                                    <div className={`w-2 h-2 rounded-full bg-current ${borderColor.replace('border-', 'text-').replace('/30', '')}`} />
                                                    <p className="text-[10px] uppercase tracking-widest font-black text-white/40 group-hover:text-white/60 transition-colors line-clamp-1">{item.title}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    {items.length === 0 && (
                                        <div className="col-span-full h-48 bg-white/[0.02] border border-dashed border-white/10 rounded-[48px] flex items-center justify-center text-white/20 font-black tracking-widest uppercase mt-10">
                                            No knowledge saved yet. Go save something!
                                        </div>
                                    )}
                                </div>
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
