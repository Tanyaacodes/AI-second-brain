import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Sparkles, Brain, Search, Quote, Map, Lock,
    ArrowRight, Globe, Zap, Shield, Database,
    Chrome, Youtube, Twitter, FileText, CheckCircle2,
    Layers, Cpu, Cloud, RefreshCcw, ExternalLink,
    Code, Terminal, Network, Bookmark
} from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
    const featuresRef = useRef(null);
    const mechanismRef = useRef(null);

    const scrollToSection = (ref) => {
        ref.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const mainFeatures = [
        {
            icon: Search,
            title: "Smart Search",
            desc: "Find anything using simple words. Burfi understands the 'meaning' of what you saved.",
            color: "text-orange-500",
            bg: "bg-orange-500/10"
        },
        {
            icon: Bookmark,
            title: "Save Anything",
            desc: "Save PDFs, Twitter posts, LinkedIn links, and YouTube videos with one click.",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            icon: Map,
            title: "Smart Graphs",
            desc: "See how your saved links and notes are connected to each other automatically.",
            color: "text-purple-500",
            bg: "bg-purple-500/10"
        },
        {
            icon: RefreshCcw,
            title: "Reminders",
            desc: "Burfi shows you important things you saved months ago so you never forget them.",
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            icon: Chrome,
            title: "Quick Save",
            desc: "Use our simple tool to save from any website without leaving your browser tab.",
            color: "text-red-500",
            bg: "bg-red-500/10"
        },
        {
            icon: Quote,
            title: "Key Highlights",
            desc: "Burfi reads your links and extracts the most important points for you automatically.",
            color: "text-orange-400",
            bg: "bg-orange-400/10"
        }
    ];

    const pipelineSteps = [
        {
            id: "01",
            title: "Capture",
            desc: "Just paste a link or use the extension to save PDFs, Tweets, and articles instantly.",
            icon: Cloud,
            color: "text-orange-500",
            visual: (
                <div className="flex gap-2">
                    <div className="w-8 h-8 rounded bg-red-500/10 flex items-center justify-center text-red-500"><Youtube size={14} /></div>
                    <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center text-blue-400"><Twitter size={14} /></div>
                    <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Chrome size={14} /></div>
                </div>
            )
        },
        {
            id: "02",
            title: "Organize",
            desc: "Burfi reads your content and automatically puts it into right categories and tags.",
            icon: Cpu,
            color: "text-blue-500",
            visual: (
                <div className="w-full bg-white/5 rounded-lg p-3 space-y-2">
                    <div className="h-1 w-full bg-blue-500/30 rounded animate-shimmer" />
                    <div className="h-1 w-3/4 bg-blue-500/20 rounded" />
                    <div className="h-1 w-1/2 bg-blue-500/10 rounded" />
                </div>
            )
        },
        {
            id: "03",
            title: "Relate",
            desc: "Burfi connects your new item with old ones so you can see the bigger picture.",
            icon: Network,
            color: "text-purple-500",
            visual: (
                <div className="flex items-center justify-center gap-4 py-2">
                    <div className="w-4 h-4 rounded-full bg-purple-500 animate-ping" />
                    <div className="h-[1px] w-12 bg-white/10" />
                    <div className="w-4 h-4 rounded-full bg-white/10" />
                </div>
            )
        }
    ];

    const platformIcons = [
        { icon: Youtube, color: "text-red-500", label: "YouTube" },
        { icon: Twitter, color: "text-blue-400", label: "Twitter" },
        { icon: Chrome, color: "text-emerald-500", label: "Chrome" },
        { icon: FileText, color: "text-orange-500", label: "PDFs" },
    ];

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-orange-500/30 overflow-x-hidden font-sans">
            {/* Ambient Background Elements */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/[0.03] rounded-full blur-[100px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 p-5 md:px-10 flex items-center justify-between backdrop-blur-xl bg-black/40 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500 rounded-xl shadow-lg">
                        <Sparkles size={18} className="text-white fill-current" />
                    </div>
                    <span className="text-xl font-black tracking-tighter font-cursive">Burfi</span>
                </div>
                <div className="hidden lg:flex items-center gap-8 pr-10">
                    <button onClick={() => scrollToSection(featuresRef)} className="text-[10px] font-black uppercase tracking-[2px] text-white/40 hover:text-white transition-colors duration-300">Features</button>
                    <button onClick={() => scrollToSection(mechanismRef)} className="text-[10px] font-black uppercase tracking-[2px] text-white/40 hover:text-white transition-colors duration-300">How it works</button>
                </div>
                <button
                    onClick={onGetStarted}
                    className="px-6 py-2.5 bg-white text-black hover:bg-orange-500 hover:text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
                >
                    Get Started
                </button>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-40 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-8"
                >
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-[4px] text-white/60">Your AI Powered Second Brain</span>
                    </div>

                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[1.1] max-w-5xl mx-auto uppercase">
                        Save Anything. <br />
                        <span className="text-orange-500 font-cursive py-1 inline-block normal-case tracking-tight text-6xl md:text-8xl">Remember Everything.</span>
                    </h1>

                    <p className="text-base md:text-lg text-white/30 max-w-3xl mx-auto font-medium leading-relaxed">
                        Burfi makes it easy to save <span className="text-white/80">PDFs, Twitter Posts, Articles, and Links</span> in one place. We automatically organize them so you can find them whenever you need.
                    </p>

                    <div className="flex flex-col items-center gap-12 pt-8">
                        <button
                            onClick={onGetStarted}
                            className="group relative px-10 py-5 bg-orange-500 rounded-3xl overflow-hidden transition-all shadow-2xl shadow-orange-500/20 active:scale-95"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            <div className="relative flex items-center gap-3">
                                <span className="text-xs font-black uppercase tracking-[5px]">Build My Library</span>
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </button>

                        <div className="flex flex-col items-center gap-6">
                            <p className="text-[9px] font-black uppercase tracking-[10px] text-white/10">Works with everything</p>
                            <div className="flex items-center gap-8 md:gap-14 opacity-20 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                                {platformIcons.map((p, i) => (
                                    <p.icon key={i} size={24} className={p.color} />
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section ref={featuresRef} className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
                <div className="text-center mb-20 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase font-cursive text-orange-500 lowercase">What it does.</h2>
                    <div className="w-16 h-1 bg-white/10 mx-auto rounded-full" />
                    <p className="text-white/20 uppercase font-bold tracking-[8px] text-[9px]">Everything you need in one simple place.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {mainFeatures.map((f, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.03)" }}
                            className="p-8 bg-white/[0.015] border border-white/5 rounded-[40px] hover:border-orange-500/20 transition-all group flex flex-col items-start text-left"
                        >
                            <div className={`w-12 h-12 ${f.bg} rounded-[18px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <f.icon className={f.color} size={24} />
                            </div>
                            <h3 className="text-lg font-black mb-3 tracking-tighter uppercase tracking-[2px]">{f.title}</h3>
                            <p className="text-white/30 text-[12px] font-medium leading-relaxed">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* The Mechanism */}
            <section ref={mechanismRef} className="py-40 bg-[#080808] relative">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="text-center mb-24 space-y-6">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase font-cursive text-orange-500 lowercase">
                            How it <span className="text-white font-sans uppercase tracking-tighter">works.</span>
                        </h2>
                        <p className="text-sm text-white/30 uppercase font-black tracking-[12px]">Simple. Direct. Powerful.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {pipelineSteps.map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.2 }}
                                className="relative p-10 bg-white/[0.01] border border-white/5 rounded-[60px] overflow-hidden group hover:border-white/10 transition-all flex flex-col gap-10"
                            >
                                <div className="absolute top-0 right-0 p-8 text-4xl font-black text-white/[0.02] group-hover:text-orange-500/5 transition-colors">
                                    {s.id}
                                </div>
                                <div className={`w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center ${s.color} group-hover:scale-110 transition-transform`}>
                                    <s.icon size={32} />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-black uppercase tracking-widest">{s.title}</h3>
                                    <p className="text-sm text-white/30 font-medium leading-relaxed">{s.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Very Bottom Footer */}
            <footer className="py-20 border-t border-white/5 flex flex-col md:flex-row items-center justify-between px-6 md:px-10 gap-8">
                <div className="flex items-center gap-3 opacity-50">
                    <Sparkles className="text-orange-500" size={16} />
                    <span className="text-lg font-black tracking-tighter uppercase">Burfi AI</span>
                </div>
                <div className="flex gap-8 text-white/20 text-[9px] font-black uppercase tracking-widest">
                    <button onClick={() => scrollToSection(featuresRef)} className="hover:text-white transition-colors">Features</button>
                    <button onClick={() => scrollToSection(mechanismRef)} className="hover:text-white transition-colors">How it works</button>
                    <a href="#" className="hover:text-white transition-colors">Privacy</a>
                </div>
                <p className="text-white/10 text-[9px] font-black uppercase tracking-widest">© 2026 Burfi Intelligence</p>
            </footer>
        </div>
    );
};

export default LandingPage;
