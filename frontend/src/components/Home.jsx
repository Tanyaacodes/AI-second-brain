import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import KnowledgeGraph from './KnowledgeGraph';
import { Search, Plus, Sparkles, Pin, History, Link, Filter, Globe, ChevronRight, Share2, Trash2, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = 'http://localhost:5000/api/v1/knowledge';

const Home = () => {
  const [items, setItems] = useState([]);
  const [memories, setMemories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); 
  const [isSaving, setIsSaving] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [newSave, setNewSave] = useState({ title: "", url: "", content: "", type: "article", tags: "" });

  const fetchItems = async () => {
    try {
      const res = await axios.get(API_BASE);
      setItems(res.data.data);
    } catch (err) { console.error("Fetch Error:", err); }
  };

  const fetchMemories = async () => {
    try {
      const res = await axios.get(`${API_BASE}/resurface`);
      setMemories(res.data.data);
    } catch (err) { console.error("Memory Error:", err); }
  };

  useEffect(() => {
    fetchItems();
    fetchMemories();
  }, []);

  const handleSearch = async (val) => {
    setSearchQuery(val);
    if(val.trim().length > 0) {
      try {
        const res = await axios.get(`${API_BASE}/search?q=${encodeURIComponent(val)}`);
        setItems(res.data.data);
      } catch (err) { console.error("Search Error:", err); }
    } else {
      fetchItems();
    }
  };

  const handleUrlPaste = async (inputUrl) => {
    setNewSave(prev => ({ ...prev, url: inputUrl }));
    if(inputUrl.startsWith('http')) {
        setIsScraping(true);
        try {
            const res = await axios.get(`${API_BASE}/scrape?url=${encodeURIComponent(inputUrl)}`);
            if(res.data.success) {
                setNewSave(prev => ({ 
                    ...prev, 
                    title: res.data.data.title || prev.title,
                    content: res.data.data.content || prev.content 
                }));
            }
        } catch (err) { console.error("Scrape Error:", err); }
        setIsScraping(false);
    }
  };

  const handleSave = async () => {
    if(!newSave.url) return alert("Please provide a URL or content.");
    setIsSaving(true);
    try {
      await axios.post(`${API_BASE}/save`, {
        ...newSave,
        tags: newSave.tags ? newSave.tags.split(',').map(t => t.trim()) : []
      });
      setNewSave({ title: "", url: "", content: "", type: "article", tags: "" });
      fetchItems();
    } catch (err) { console.error("Save Error:", err); }
    setIsSaving(false);
  };

  const handleDelete = async (id) => {
    if(window.confirm("Purge this from your brain memory?")) {
        try {
            await axios.delete(`${API_BASE}/${id}`);
            fetchItems();
        } catch (err) { console.error("Delete Error:", err); }
    }
  };

  const filteredItems = items.filter(i => activeTab === 'all' || i.type === activeTab);

  return (
    <div className="min-h-screen bg-[#050505] text-[#F9FAFB] font-sans selection:bg-blue-500/30 overflow-hidden flex flex-col">
      
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="flex-1 flex max-w-screen-2xl mx-auto w-full relative z-10">
        
        {/* Sidebar Navigation */}
        <aside className="w-20 lg:w-64 border-r border-white/10 p-6 flex flex-col gap-10 hidden md:flex backdrop-blur-3xl bg-black/20">
            <div className="px-2 flex items-center gap-2">
                <BrainCircuit className="text-blue-500" size={24} />
                <h1 className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent hidden lg:block">Dea.ai</h1>
            </div>
            
            <nav className="flex-1 flex flex-col gap-2">
                {['all', 'article', 'video', 'tweet', 'pdf'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${activeTab === tab ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                        <Filter size={16} />
                        <span className="capitalize hidden lg:block">{tab}</span>
                    </button>
                ))}
            </nav>

            <div className="p-4 bg-gradient-to-br from-blue-500/20 to-transparent rounded-2xl border border-blue-500/20">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Memory Status</p>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-[85%] h-full bg-blue-400" />
                </div>
                <p className="text-[10px] text-white/40 mt-2">Semantic Core Active</p>
            </div>
        </aside>

        {/* Main Interface */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Top Bar / Search */}
          <header className="p-6 flex flex-col lg:flex-row justify-between items-center gap-6 border-b border-white/5 bg-black/10 backdrop-blur-md sticky top-0 z-50">
            <div className="relative w-full max-w-2xl group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-blue-400 transition-colors" />
                <input 
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search titles, tags or topics..."
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl py-3.5 pl-12 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-light"
                />
            </div>
            <div className="flex items-center gap-4">
                <button className="p-2.5 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all text-blue-400">
                    <Sparkles size={18} />
                </button>
            </div>
          </header>

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10 custom-scrollbar">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* Left Column: Feed & Graph */}
                <div className="lg:col-span-8 space-y-10">
                    
                    {/* Visual Section */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <div>
                                <h2 className="text-sm font-bold uppercase tracking-widest text-white/80">Brain Topology</h2>
                                <p className="text-[10px] text-white/30 italic">Interactive visualization of related concepts</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-white/50 uppercase tracking-tighter">Live Neural Sync</span>
                            </div>
                        </div>
                        <div className="p-1.5 bg-black/40 rounded-3xl shadow-2xl border border-white/5 overflow-hidden">
                            <KnowledgeGraph items={items} />
                        </div>
                    </section>

                    {/* Content Section */}
                    <section className="space-y-6">
                         <div className="flex items-center gap-3 px-2">
                            <History size={18} className="text-blue-500" />
                            <h2 className="font-bold text-lg">Knowledge Store</h2>
                         </div>

                        {filteredItems.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                                <div className="p-4 bg-white/5 rounded-full"><Plus className="text-white/20" /></div>
                                <p className="text-white/30 text-sm">Your knowledge pool is empty.<br/>Save a link to see it appear here.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <AnimatePresence mode='popLayout'>
                                    {filteredItems.map((item, idx) => (
                                        <motion.div 
                                            key={item._id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group p-6 bg-white/[0.03] border border-white/[0.08] hover:border-blue-500/30 rounded-3xl hover:bg-white/[0.05] transition-all relative flex flex-col"
                                        >
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${item.type === 'video' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'}`} />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{item.type}</span>
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button 
                                                        onClick={() => handleDelete(item._id)}
                                                        className="p-1.5 bg-white/5 rounded-lg border border-white/10 text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all"
                                                    >
                                                        <Trash2 size={12}/>
                                                    </button>
                                                </div>
                                            </div>
                                            <h3 className="font-semibold text-white/90 group-hover:text-white transition-colors line-clamp-2 leading-relaxed mb-4">{item.title}</h3>
                                            
                                            <div className="flex flex-wrap gap-2 mt-auto pb-2">
                                                {item.tags?.map(tag => (
                                                    <span key={tag} className="px-2.5 py-1 bg-blue-500/5 rounded-full text-[10px] text-blue-400/60 border border-blue-500/10"># {tag}</span>
                                                ))}
                                            </div>
                                            
                                            <a href={item.url} target="_blank" rel="noreferrer" className="absolute bottom-4 right-4 p-2 bg-blue-500/10 rounded-full text-blue-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-500 hover:text-white">
                                                <ChevronRight size={16} />
                                            </a>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </section>
                </div>

                {/* Right Column: Clipper & Memories */}
                <div className="lg:col-span-4 space-y-8">
                    
                    {/* Floating Save Tool */}
                    <div className="sticky top-24 bg-[#0A0A0A]/80 backdrop-blur-3xl p-8 rounded-[32px] border border-white/10 shadow-2xl space-y-6">
                         <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/30">
                                <Link size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold">Neural Clipper</h3>
                                <p className="text-[11px] text-white/40 italic">Paste link to commit to memory</p>
                            </div>
                         </div>

                         <div className="space-y-4">
                            <div className="relative">
                                <Globe className={`absolute left-4 top-1/2 -translate-y-1/2 size-4 transition-all ${isScraping ? 'text-blue-400 animate-spin' : 'text-white/30'}`} />
                                <input 
                                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                                    placeholder="Paste URL..."
                                    value={newSave.url}
                                    onChange={(e) => handleUrlPaste(e.target.value)}
                                />
                            </div>
                            
                            <input 
                                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl py-3.5 px-5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
                                placeholder={isScraping ? "Scraping page data..." : "Optional Title"}
                                value={newSave.title}
                                onChange={(e) => setNewSave({...newSave, title: e.target.value})}
                            />
                            
                            <textarea 
                                className="w-full h-32 bg-white/[0.05] border border-white/[0.1] rounded-2xl py-4 px-5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/30 resize-none transition-all"
                                placeholder="Add highlights or notes..."
                                value={newSave.content}
                                onChange={(e) => setNewSave({...newSave, content: e.target.value})}
                            />

                            <button 
                                onClick={handleSave}
                                disabled={isSaving || !newSave.url}
                                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all font-bold text-sm tracking-wide shadow-xl ${isSaving ? 'bg-white/10 text-white/20' : 'bg-white text-black hover:bg-blue-400 hover:text-white'}`}
                            >
                                {isSaving ? <Sparkles className="animate-spin" size={18} /> : <Plus size={18} />}
                                {isSaving ? "Organizing Knowledge..." : "Commit to Memory"}
                            </button>
                         </div>
                    </div>

                    {/* AI Insights & Memories */}
                    <div className="p-8 bg-gradient-to-br from-purple-500/10 to-transparent rounded-[32px] border border-purple-500/20 space-y-6">
                        <div className="flex items-center gap-3">
                            <Sparkles className="text-purple-400" size={18} />
                            <h3 className="font-bold text-purple-100">Neural Recall</h3>
                        </div>
                        
                        {memories.length > 0 ? (
                            <div className="space-y-4">
                                <p className="text-[11px] text-purple-200/40 uppercase tracking-widest font-bold">Resurfaced from history</p>
                                {memories.map(m => (
                                    <div key={m._id} className="p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer">
                                        <p className="text-xs font-semibold text-white/90 line-clamp-1 mb-2">{m.title}</p>
                                        <p className="text-[10px] text-white/30 line-clamp-2">{m.content}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="px-4 py-8 text-center bg-black/20 rounded-2xl border border-dashed border-white/5">
                                <History size={24} className="mx-auto text-white/10 mb-2" />
                                <p className="text-[11px] text-white/20">Collecting history to resurface memories later.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
};

export default Home;
