import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Brain, Search, Quote, Map as MapIcon, Lock,
    ArrowRight, Globe, Zap, Shield, Database,
    Chrome, Youtube, Twitter, FileText, CheckCircle2,
    Layers, Cpu, Cloud, RefreshCcw, ExternalLink,
    Code, Terminal, Network, Bookmark, ChevronDown, Github, Linkedin, Instagram, Youtube as YoutubeIcon
} from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
    const featuresRef = useRef(null);
    const mechanismRef = useRef(null);
    const faqRef = useRef(null);

    const [openFaq, setOpenFaq] = useState(null);

    const scrollToSection = (ref) => {
        ref.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const mainFeatures = [
        {
            icon: Search,
            title: "Smart Search",
            desc: "Find anything using simple words. Burfi understands the 'meaning' of what you saved.",
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            visual: (
                <div className="w-full h-32 bg-black/40 rounded-2xl p-4 overflow-hidden border border-white/5 relative">
                    <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5 mb-4 group-hover:border-orange-500/30 transition-all">
                        <Search size={14} className="text-white/20" />
                        <div className="h-1.5 w-24 bg-white/10 rounded" />
                    </div>
                    <div className="space-y-2 opacity-50">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                            <div className="h-1.5 w-32 bg-white/5 rounded" />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500/30" />
                            <div className="h-1.5 w-24 bg-white/5 rounded" />
                        </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-orange-500/5 blur-2xl rounded-full" />
                </div>
            )
        },
        {
            icon: Bookmark,
            title: "Save Anything",
            desc: "Save PDFs, Twitter posts, LinkedIn links, and YouTube videos with one click.",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            visual: (
                <div className="w-full h-32 bg-black/40 rounded-2xl p-4 overflow-hidden border border-white/5 flex gap-2">
                    <div className="flex-1 space-y-3">
                        <div className="h-10 w-full bg-white/5 rounded-xl flex items-center justify-center border border-white/5 transition-all group-hover:scale-105">
                            <Youtube size={16} className="text-red-500" />
                        </div>
                        <div className="h-10 w-full bg-white/5 rounded-xl flex items-center justify-center border border-white/5 transition-all group-hover:scale-105 delay-75">
                            <Twitter size={16} className="text-blue-400" />
                        </div>
                    </div>
                    <div className="w-1/3 bg-orange-500/10 rounded-xl flex items-center justify-center border border-orange-500/20">
                        <Sparkles size={20} className="text-orange-500 animate-pulse" />
                    </div>
                </div>
            )
        },
        {
            icon: MapIcon,
            title: "Smart Graphs",
            desc: "See how your saved links and notes are connected to each other automatically.",
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            visual: (
                <div className="w-full h-32 bg-black/40 rounded-2xl p-2 overflow-hidden border border-white/5 flex items-center justify-center">
                    <div className="relative w-full h-full flex items-center justify-center">
                        <div className="absolute w-12 h-12 bg-purple-500/10 rounded-full border border-purple-500/20 animate-pulse" />
                        <div className="absolute w-2 h-2 bg-purple-500 rounded-full" />
                        {[0, 60, 120, 180, 240, 300].map((deg) => (
                            <div
                                key={deg}
                                className="absolute w-8 h-[1px] bg-white/10 origin-left"
                                style={{ transform: `rotate(${deg}deg) translateX(12px)` }}
                            />
                        ))}
                    </div>
                </div>
            )
        }
    ];

    const pipelineSteps = [
        {
            id: "01",
            title: "Capture",
            desc: "Just paste a link or use the extension to save PDFs, Tweets, and articles instantly.",
            icon: Cloud,
            color: "text-orange-500",
        },
        {
            id: "02",
            title: "Organize",
            desc: "Burfi reads your content and automatically puts it into right categories and tags.",
            icon: Cpu,
            color: "text-blue-500",
        },
        {
            id: "03",
            title: "Relate",
            desc: "Burfi connects your new item with old ones so you can see the bigger picture.",
            icon: Network,
            color: "text-purple-500",
        }
    ];

    const faqs = [
        { q: "What is Burfi exactly?", a: "Burfi is your AI-powered second brain. It's a high-performance space where you can dump links, PDFs, notes, and tweets. We use AI to automatically summarize, categorize, and even link them together so you never lose an idea again." },
        { q: "How does the AI organization work?", a: "When you save something, our AI 'reads' the content, extracts the core meaning, and creates a high-dimensional embedding. This allows Burfi to group similar items together even if they don't share the same keywords." },
        { q: "Can I import my existing links?", a: "Absolutely. You can paste multiple links at once or use our upcoming browser extension to sync your entire bookmark library in seconds." },
        { q: "Is my data secure?", a: "Yes. Your memories are encrypted and private. We use industry-standard security protocols to ensure that only you have access to your personal digital library." }
    ];

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-orange-500/30 overflow-x-hidden font-sans">
            {/* Ambient Background Elements */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-orange-500/[0.03] rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-500/[0.02] rounded-full blur-[150px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.02]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
            </div>

            {/* Navbar - Premium Look */}
            <nav className="fixed top-0 w-full z-50 p-6 md:px-12 flex items-center justify-between backdrop-blur-3xl bg-black/40 border-b border-white/5">
                <div className="flex items-center gap-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                            <Sparkles size={20} className="text-white fill-current" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter font-cursive">Burfi</span>
                    </div>
                    <div className="hidden lg:flex items-center gap-8 pr-10">
                        <button onClick={() => scrollToSection(featuresRef)} className="text-[10px] font-black uppercase tracking-[3px] text-white/40 hover:text-orange-500 transition-colors duration-300">Features</button>
                        <button onClick={() => scrollToSection(mechanismRef)} className="text-[10px] font-black uppercase tracking-[3px] text-white/40 hover:text-orange-500 transition-colors duration-300">How it works</button>
                        <button onClick={() => scrollToSection(faqRef)} className="text-[10px] font-black uppercase tracking-[3px] text-white/40 hover:text-orange-500 transition-colors duration-300">FAQ</button>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={onGetStarted} className="hidden md:block text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-all">Sign In</button>
                    <button
                        onClick={onGetStarted}
                        className="px-8 py-3 bg-orange-500 hover:bg-white text-white hover:text-black rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-orange-500/20 active:scale-95 hover:scale-105"
                    >
                        Getting Started
                    </button>
                </div>
            </nav>

            {/* Hero Section - Rachna Inspired */}
            <section className="relative pt-24 pb-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
                {/* Huge Watermark */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-black text-white/[0.01] pointer-events-none select-none z-[-1] tracking-tighter leading-none">
                    BURFI
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-10"
                >
                    <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full mb-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[5px] text-white/80">100+ Monthly Links Saved</span>
                    </div>

                    <h1 className="text-6xl md:text-[7rem] font-bold tracking-tight leading-[0.9] max-w-6xl mx-auto text-white">
                        Smartly Saved. <br />
                        <span className="font-cursive text-orange-500 normal-case tracking-tight px-4">Sweetly Remembered.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-white/40 max-w-3xl mx-auto font-medium leading-relaxed">
                        Burfi is the AI-powered space that automatically <span className="text-white/80">saves, organizes, and relates</span> your PDFs, Tweets, and Links—so you can stop hoarding and start remembering.
                    </p>

                    <div className="flex flex-col items-center gap-14 pt-4">
                        <button
                            onClick={onGetStarted}
                            className="group relative px-12 py-6 bg-orange-500 rounded-2xl overflow-hidden transition-all shadow-2xl shadow-orange-500/30 active:scale-95 hover:scale-105"
                        >
                            <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            <div className="relative flex items-center gap-4 text-white group-hover:text-black">
                                <span className="text-sm font-black uppercase tracking-[5px]">Build My Library</span>
                                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                            </div>
                        </button>

                        {/* Social Proof like Rachna */}
                        <div className="flex flex-col items-center gap-6">
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4, 5].map((idx) => (
                                    <div key={idx} className="w-12 h-12 rounded-full border-4 border-[#0A0A0A] bg-white/10 overflow-hidden">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${idx + 10}`} alt="User" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => <Sparkles key={i} size={12} className="text-yellow-500 fill-current" />)}
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[4px] text-white/30">Trusted by 500+ digital collectors</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Features Section - Upgraded with Mockups */}
            <section ref={featuresRef} className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
                <div className="flex flex-col items-center text-center mb-32 space-y-6">
                    <h2 className="text-5xl md:text-7xl font-black tracking-tight text-white uppercase">Features</h2>
                    <div className="w-32 h-1 bg-orange-500/20 rounded-full mb-4" />
                    <p className="text-white/20 uppercase font-black tracking-[12px] text-[10px]">Everything you need to stay organized.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {mainFeatures.map((f, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -10 }}
                            className="p-1.5 bg-white/5 border border-white/10 rounded-[48px] transition-all group overflow-hidden"
                        >
                            <div className="bg-[#0A0A0A] rounded-[44px] p-8 h-full flex flex-col border border-white/5 group-hover:border-white/10 transition-colors">
                                <div className="mb-10 group-hover:scale-105 transition-transform duration-500">
                                    {f.visual}
                                </div>
                                <h3 className="text-2xl font-black mb-4 tracking-tighter uppercase">{f.title}</h3>
                                <p className="text-white/30 text-sm font-medium leading-relaxed">{f.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Same Humorous Banner from Burfi - The Merge */}
            {/* Seamless Humorous Banner (Integrated UI) */}
            <div className="w-full bg-[#0A0A0A] overflow-hidden py-24 relative z-20 flex items-center">
                <motion.div
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ repeat: Infinity, ease: "linear", duration: 40 }}
                    className="flex text-white/20 whitespace-nowrap w-max items-center"
                >
                    {[...Array(2)].map((_, arrayIndex) => (
                        <div key={arrayIndex} className="flex items-center">
                            {[
                                "If you don't like Burfi (the dessert), you'll still like Burfi.",
                                "Your brain is full. Let us hold the links.",
                                "Built with code, caffeine, and an obsession with Indian sweets.",
                                "Side effects: Extreme organization and sudden craving for sugar.",
                                "Stop emailing links to yourself. Seriously."
                            ].map((text, i) => (
                                <React.Fragment key={i}>
                                    <span className="text-xl md:text-2xl font-black uppercase tracking-[8px] px-20">{text}</span>
                                    <Sparkles size={24} className="opacity-40" />
                                </React.Fragment>
                            ))}
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Mechanism - Cleaner */}
            <section ref={mechanismRef} className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-end justify-between mb-32 gap-10">
                    <div className="space-y-6 max-w-2xl">
                        <h2 className="text-5xl md:text-8xl font-black tracking-tight text-white leading-none uppercase">How it <br /><span className="font-cursive text-orange-500 normal-case tracking-tight">works.</span></h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {pipelineSteps.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.2 }}
                            className="relative p-12 bg-white/[0.02] border border-white/10 rounded-[64px] group transition-all"
                        >
                            <div className="absolute top-10 right-10 text-8xl font-black text-white/[0.02] group-hover:text-orange-500/5 transition-colors">
                                {s.id}
                            </div>
                            <div className={`w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center ${s.color} group-hover:scale-110 group-hover:text-white transition-all`}>
                                <s.icon size={40} strokeWidth={1.5} />
                            </div>
                            <div className="mt-12 space-y-6">
                                <h3 className="text-3xl font-black tracking-tight uppercase">{s.title}</h3>
                                <p className="text-base text-white/30 font-medium leading-relaxed">{s.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* FAQ Section like Rachna */}
            <section ref={faqRef} className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
                    <div className="space-y-8">
                        <h2 className="text-5xl md:text-6xl font-black tracking-tight uppercase leading-[0.9]">Got Questions? <br /><span className="text-orange-500 font-cursive normal-case tracking-tight">We Got Answers</span></h2>
                        <p className="text-white/30 text-lg max-w-md font-medium leading-relaxed">Clear, practical tips and guidance to help you design, build, and ship your memories with confidence.</p>
                    </div>
                    <div className="space-y-4">
                        {faqs.map((f, i) => (
                            <div key={i} className="border-b border-white/5">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full py-8 flex items-center justify-between text-left group"
                                >
                                    <span className="text-xl font-bold text-white group-hover:text-orange-500 transition-colors uppercase tracking-tight">{f.q}</span>
                                    <ChevronDown size={24} className={`text-white transition-transform duration-500 ${openFaq === i ? 'rotate-180 text-orange-500' : 'opacity-20'}`} />
                                </button>
                                <AnimatePresence>
                                    {openFaq === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <p className="pb-8 text-white/40 text-base leading-relaxed">{f.a}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Professional Multi-Column Footer like Rachna */}
            <footer className="group relative pt-60 pb-20 bg-[#0A0A0A]">
                {/* Giant Animated Watermark (Bleeds into FAQ section for seamless look) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/4 text-[28vw] font-black pointer-events-none select-none tracking-tighter leading-none z-0 italic 
                    text-transparent bg-clip-text bg-gradient-to-t from-orange-500/20 to-orange-500/5 bg-[length:100%_0%] bg-no-repeat bg-bottom
                    transition-all duration-[2000ms] ease-out
                    [-webkit-text-stroke:1px_rgba(255,255,255,0.08)]
                    group-hover:bg-[length:100%_100%] group-hover:[-webkit-text-stroke:1px_transparent]">
                    BURFI
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-20">
                    <div className="flex flex-col lg:flex-row justify-between gap-20">
                        {/* Left Side: Logo & Socials */}
                        <div className="space-y-12">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-500 rounded-xl">
                                    <Sparkles size={24} className="text-white fill-current" />
                                </div>
                                <span className="text-4xl font-black tracking-tighter text-white font-cursive">Burfi</span>
                            </div>

                            <div className="flex gap-5">
                                {[Twitter, Linkedin, Instagram, YoutubeIcon].map((Icon, idx) => (
                                    <a key={idx} href="#" className="text-white/20 hover:text-white transition-colors">
                                        <Icon size={22} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Right Side: Link Columns */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-16 md:gap-24">
                            <div className="space-y-8">
                                <h4 className="text-[11px] font-black uppercase tracking-[4px] text-white/90">Product</h4>
                                <ul className="space-y-4 text-sm font-medium text-white/30">
                                    <li><button onClick={() => scrollToSection(featuresRef)} className="hover:text-orange-500 transition-all">Features</button></li>
                                    <li><button onClick={() => scrollToSection(mechanismRef)} className="hover:text-white transition-all">How it works</button></li>
                                    <li><a href="#" className="hover:text-white transition-all">Templates</a></li>
                                    <li><a href="#" className="hover:text-white transition-all">Changelog</a></li>
                                </ul>
                            </div>

                            <div className="space-y-8">
                                <h4 className="text-[11px] font-black uppercase tracking-[4px] text-white/90">Legal</h4>
                                <ul className="space-y-4 text-sm font-medium text-white/30">
                                    <li><a href="#" className="hover:text-white transition-all">About Us</a></li>
                                    <li><a href="#" className="hover:text-white transition-all">Privacy Policy</a></li>
                                    <li><a href="#" className="hover:text-white transition-all">Terms & Conditions</a></li>
                                    <li><a href="#" className="hover:text-white transition-all">Refund Policy</a></li>
                                </ul>
                            </div>

                            <div className="space-y-8">
                                <h4 className="text-[11px] font-black uppercase tracking-[4px] text-white/90">Socials</h4>
                                <ul className="space-y-4 text-sm font-medium text-white/30">
                                    <li><a href="#" className="hover:text-white transition-all">GitHub</a></li>
                                    <li><a href="#" className="hover:text-white transition-all">LinkedIn</a></li>
                                    <li><a href="#" className="hover:text-white transition-all">Twitter</a></li>
                                    <li><a href="#" className="hover:text-white transition-all">YouTube</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Minimal Bottom Bar */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-20 mt-20 border-t border-white/5 opacity-30">
                        <p className="text-[10px] font-black uppercase tracking-[2px]">Designed & Built by Tanyaaaaa</p>
                        <p className="text-[10px] font-black uppercase tracking-[2px]">© 2026 all rights reserved</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

