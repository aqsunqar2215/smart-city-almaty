import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Menu,
    X,
    ChevronRight,
    Code2,
    Terminal,
    Cpu,
    Shield,
    Zap,
    Globe,
    Copy,
    Check,
    ExternalLink,
    BookOpen,
    Rocket,
    ArrowRight,
    Hash,
    Lightbulb,
    Github,
    Users,
    MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const Docs: React.FC = () => {
    const [activeSection, setActiveSection] = useState('intro');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const navigation = [
        {
            title: 'Introduction',
            items: [
                { id: 'intro', title: 'Welcome to Neural SDK', icon: BookOpen },
                { id: 'vision', title: 'Our Vision', icon: Globe },
                { id: 'what-is', title: 'What we are building', icon: Rocket },
            ]
        },
        {
            title: 'Integration',
            items: [
                { id: 'install', title: 'Installation', icon: Terminal },
                { id: 'auth', title: 'Authentication', icon: Shield },
                { id: 'api-keys', title: 'API Keys', icon: Zap },
            ]
        },
        {
            title: 'Core APIs',
            items: [
                { id: 'neural-api', title: 'Neural API', icon: Cpu },
                { id: 'sensors', title: 'City Sensor Data', icon: Hash },
            ]
        },
        {
            title: 'Solutions & Network',
            items: [
                { id: 'solutions', title: 'Solutions Showcase', icon: Lightbulb },
                { id: 'network', title: 'Network Infrastructure', icon: Globe },
            ]
        },
        {
            title: 'Ecosystem',
            items: [
                { id: 'grants', title: 'Grants & Funding', icon: Lightbulb },
                { id: 'guidelines', title: 'Partnership Guidelines', icon: Rocket },
            ]
        }
    ];

    const allItems = navigation.flatMap(n => n.items);
    const activeItem = allItems.find(i => i.id === activeSection) || allItems[0];

    // Scroll Spy Logic
    useEffect(() => {
        const observers = new Map();
        const sectionIds = allItems.map(item => item.id);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                    setActiveSection(entry.target.id);
                }
            });
        }, { threshold: [0.1, 0.5, 0.9], rootMargin: '-80px 0px -50% 0px' });

        sectionIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [allItems]);

    // Scroll to section logic
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const yOffset = -100;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
            setActiveSection(id);
            setIsSidebarOpen(false);
        }
    };

    const handlePagination = (direction: 'prev' | 'next') => {
        const currentIndex = allItems.findIndex(item => item.id === activeSection);
        if (direction === 'next' && currentIndex < allItems.length - 1) {
            scrollToSection(allItems[currentIndex + 1].id);
        } else if (direction === 'prev' && currentIndex > 0) {
            scrollToSection(allItems[currentIndex - 1].id);
        }
    };

    const filteredNavigation = searchQuery.trim() === ''
        ? navigation
        : navigation.map(group => ({
            ...group,
            items: group.items.filter(item =>
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.id.toLowerCase().includes(searchQuery.toLowerCase())
            )
        })).filter(group => group.items.length > 0);

    const openLink = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    // Placeholder for navigate function, assuming it's part of a router
    const navigate = (path: string) => {
        console.log(`Navigating to: ${path}`);
        // In a real app, this would be a router navigation, e.g., router.push(path)
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-primary/30">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 h-16 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl z-50 flex items-center justify-between px-6">
                <div className="flex items-center gap-10">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => navigate('/')}
                    >
                        <div className="w-9 h-9 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(var(--primary),0.4)] transition-all duration-500">
                            <Cpu className="w-5 h-5 text-primary animate-pulse" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-black tracking-tighter text-white italic leading-none">NEURAL SDK</span>
                            <span className="text-[8px] font-bold tracking-[0.3em] text-primary/80 uppercase">System Core</span>
                        </div>
                    </div>

                    <nav className="hidden lg:flex items-center h-full gap-4">
                        {/* LEARN */}
                        <div className="relative group/nav px-2 h-full flex items-center">
                            <button className="flex items-center gap-1.5 text-[13px] font-bold text-slate-400 group-hover/nav:text-white transition-colors py-2 uppercase tracking-wide">
                                Learn
                                <ChevronRight className="w-3.5 h-3.5 rotate-90 transition-transform group-hover/nav:-rotate-90" />
                            </button>
                            <div className="absolute top-full left-0 w-[720px] bg-slate-900/95 border border-white/5 rounded-2xl p-8 opacity-0 translate-y-2 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:translate-y-0 group-hover/nav:pointer-events-auto transition-all shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] backdrop-blur-2xl z-[60] flex gap-12">
                                <div className="w-1/2 relative group/card rounded-xl overflow-hidden aspect-video bg-slate-800 border border-white/5">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
                                    <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-60 group-hover/card:scale-110 transition-transform duration-700" alt="Docs" />
                                    <div className="absolute bottom-6 left-6 z-20">
                                        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-1">About Neural SDK</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80 mb-4">Fast, low-latency network for city-wide assets.</p>
                                        <Button size="sm" onClick={() => scrollToSection('intro')} className="h-8 px-4 bg-white text-slate-950 font-black uppercase text-[9px] tracking-widest rounded-full hover:bg-slate-200 transition-all">
                                            Learn more <ChevronRight className="ml-1 w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-6 w-[340px]">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-white/5 pb-2">Educational</span>
                                    <div className="space-y-4">
                                        {[
                                            { title: 'Citizen ID', desc: 'Secure entry point to decentralized city services.', icon: Shield, target: 'auth' },
                                            { title: 'Dev Academy', desc: 'Master classes on urban neural infrastructure.', icon: BookOpen, target: 'intro' },
                                            { title: 'Core Systems', desc: 'Architecture blueprints for smart city nodes.', icon: Cpu, target: 'what-is' },
                                            { title: 'Learning Path', desc: 'Structured route from novice to city architect.', icon: Globe, target: 'vision' }
                                        ].map(item => (
                                            <div
                                                key={item.title}
                                                className="flex items-center gap-4 group/item cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5"
                                                onClick={() => scrollToSection(item.target)}
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/5 group-hover/item:border-primary/50 transition-all">
                                                    <item.icon className="w-5 h-5 text-slate-400 group-hover/item:text-primary transition-colors" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-white group-hover/item:text-primary transition-colors uppercase tracking-tight">{item.title}</h4>
                                                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* DEVELOPERS */}
                        <div className="relative group/nav px-2 h-full flex items-center">
                            <button className="flex items-center gap-1.5 text-[13px] font-bold text-slate-400 group-hover/nav:text-white transition-colors py-2 uppercase tracking-wide">
                                Developers
                                <ChevronRight className="w-3.5 h-3.5 rotate-90 transition-transform group-hover/nav:-rotate-90" />
                            </button>
                            <div className="absolute top-full left-0 w-[640px] bg-slate-900/95 border border-white/5 rounded-2xl p-8 opacity-0 translate-y-2 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:translate-y-0 group-hover/nav:pointer-events-auto transition-all shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] backdrop-blur-2xl z-[60] grid grid-cols-2 gap-12">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 block border-b border-white/5 pb-2">Start Building</span>
                                    <div className="space-y-6">
                                        {[
                                            { title: 'Documentation', desc: 'The full technical manual.', icon: BookOpen, target: 'intro' },
                                            { title: 'Neural API', desc: 'Direct access to the core layer.', icon: Code2, target: 'neural-api' },
                                            { title: 'Templates', desc: 'Plug & play city node boilerplate.', icon: Terminal, target: 'install' }
                                        ].map(item => (
                                            <div
                                                key={item.title}
                                                className="flex items-center gap-4 group/item cursor-pointer"
                                                onClick={() => scrollToSection(item.target)}
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/5 group-hover/item:border-primary/50 transition-all">
                                                    <item.icon className="w-5 h-5 text-slate-400 group-hover/item:text-primary" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-white group-hover/item:text-primary transition-colors uppercase tracking-tight">{item.title}</h4>
                                                    <p className="text-[10px] text-slate-500 leading-tight">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 block border-b border-white/5 pb-2">Tutorials</span>
                                    <div className="space-y-4">
                                        {[
                                            { title: 'Hello World', desc: 'Deploy your first city-scale neural node.', target: 'install' },
                                            { title: 'Legacy Integration', desc: 'Bridging 20th century hardware to Neural SDK.', target: 'what-is' },
                                            { title: 'Node Validator Setup', desc: 'Complete guide to processing city telemetry.', target: 'neural-api' },
                                            { title: 'Smart Grid Logic', desc: 'Optimizing energy flow through urban sectors.', target: 'sensors' }
                                        ].map(item => (
                                            <div
                                                key={item.title}
                                                className="group/item cursor-pointer p-3 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5"
                                                onClick={() => scrollToSection(item.target)}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-1 h-1 rounded-full bg-primary" />
                                                    <h4 className="text-xs font-bold text-slate-300 group-hover/item:text-white transition-colors uppercase tracking-wider">{item.title}</h4>
                                                </div>
                                                <p className="text-[10px] text-slate-600 leading-tight pl-3 italic">{item.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SOLUTIONS */}
                        <div className="relative group/nav px-2 h-full flex items-center">
                            <button className="flex items-center gap-1.5 text-[13px] font-bold text-slate-400 group-hover/nav:text-white transition-colors py-2 uppercase tracking-wide">
                                Solutions
                                <ChevronRight className="w-3.5 h-3.5 rotate-90 transition-transform group-hover/nav:-rotate-90" />
                            </button>
                            <div className="absolute top-full left-0 w-[720px] bg-slate-900/95 border border-white/5 rounded-2xl p-8 opacity-0 translate-y-2 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:translate-y-0 group-hover/nav:pointer-events-auto transition-all shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] backdrop-blur-2xl z-[60]">
                                <div className="grid grid-cols-3 gap-12">
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 block border-b border-white/5 pb-2">Tools</span>
                                        <div className="space-y-4">
                                            {[
                                                { title: 'Sensor Extensions', desc: 'Hardware-level data drivers.', target: 'sensors' },
                                                { title: 'Logic Tooling', desc: 'Visual nodal programming.', target: 'neural-api' },
                                                { title: 'City Wallets', desc: 'Citizen transaction APIs.', target: 'auth' },
                                                { title: 'IoT Mobile', desc: 'Mobile-first edge drivers.', target: 'install' }
                                            ].map(item => (
                                                <div
                                                    key={item.title}
                                                    className="group/item cursor-pointer"
                                                    onClick={() => scrollToSection(item.target)}
                                                >
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover/item:bg-primary transition-colors" />
                                                        <span className="text-xs font-bold text-slate-400 group-hover/item:text-white transition-colors uppercase tracking-widest">{item.title}</span>
                                                    </div>
                                                    <p className="text-[9px] text-slate-600 pl-3.5 leading-none italic">{item.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 block border-b border-white/5 pb-2">Use Cases</span>
                                        <div className="space-y-4">
                                            {[
                                                { title: 'Smart Traffic', desc: 'Dynamic intersection control.', target: 'solutions' },
                                                { title: 'Air Quality', desc: 'Pollution vector tracking.', target: 'solutions' },
                                                { title: 'Public Safety', desc: 'Emergency response mesh.', target: 'solutions' },
                                                { title: 'Energy Grid', desc: 'Decentralized load balancing.', target: 'solutions' }
                                            ].map(item => (
                                                <div
                                                    key={item.title}
                                                    className="group/item cursor-pointer"
                                                    onClick={() => scrollToSection(item.target)}
                                                >
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover/item:bg-secondary transition-colors" />
                                                        <span className="text-xs font-bold text-slate-400 group-hover/item:text-white transition-colors uppercase tracking-widest">{item.title}</span>
                                                    </div>
                                                    <p className="text-[9px] text-slate-600 pl-3.5 leading-none italic">{item.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 block border-b border-white/5 pb-2">Resources</span>
                                        <div className="space-y-4">
                                            {[
                                                { title: 'Solutions Hub', desc: 'Pre-built city modules.', target: 'what-is' },
                                                { title: 'Neural AI', desc: 'Edge processing blueprints.', target: 'neural-api' },
                                                { title: 'City DAOs', desc: 'Governance API references.', target: 'guidelines' }
                                            ].map(item => (
                                                <div
                                                    key={item.title}
                                                    className="flex items-center gap-2 group/item cursor-pointer"
                                                    onClick={() => scrollToSection(item.target)}
                                                >
                                                    <Zap className="w-3.5 h-3.5 text-slate-500 group-hover/item:text-primary transition-colors" />
                                                    <div>
                                                        <span className="text-xs font-bold text-slate-400 group-hover/item:text-white transition-colors uppercase tracking-widest block">{item.title}</span>
                                                        <p className="text-[9px] text-slate-600 leading-none italic">{item.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* NETWORK */}
                        <div className="relative group/nav px-2 h-full flex items-center">
                            <button className="flex items-center gap-1.5 text-[13px] font-bold text-slate-400 group-hover/nav:text-white transition-colors py-2 uppercase tracking-wide">
                                Network
                                <ChevronRight className="w-3.5 h-3.5 rotate-90 transition-transform group-hover/nav:-rotate-90" />
                            </button>
                            <div className="absolute top-full left-0 w-[580px] bg-slate-900/95 border border-white/5 rounded-2xl p-8 opacity-0 translate-y-2 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:translate-y-0 group-hover/nav:pointer-events-auto transition-all shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] backdrop-blur-2xl z-[60] flex gap-12">
                                <div className="w-1/2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 block border-b border-white/5 pb-2">Resources</span>
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 group/item cursor-pointer" onClick={() => scrollToSection('network')}>
                                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/5 group-hover/item:border-primary/50">
                                                <Cpu className="w-5 h-5 text-slate-400 group-hover/item:text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-white group-hover/item:text-primary">Become a validator</h4>
                                                <p className="text-[10px] text-slate-500 leading-tight">Run a Neural Processing Node.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 group/item cursor-pointer" onClick={() => scrollToSection('network')}>
                                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/5 group-hover/item:border-primary/50">
                                                <Zap className="w-5 h-5 text-slate-400 group-hover/item:text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-white group-hover/item:text-primary">Network Status</h4>
                                                <p className="text-[10px] text-slate-500 leading-tight">Live uptime and data speeds.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-1/2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 block border-b border-white/5 pb-2">Inspect</span>
                                    <div className="space-y-4 mt-2">
                                        {[
                                            { title: 'Neural Explorer', color: 'bg-primary' },
                                            { title: 'City Node Map', color: 'bg-secondary' },
                                            { title: 'Packet Inspector', color: 'bg-white/20' }
                                        ].map(item => (
                                            <div
                                                key={item.title}
                                                className="flex items-center gap-3 group/item cursor-pointer"
                                                onClick={() => scrollToSection('network')}
                                            >
                                                <div className={`w-1.5 h-1.5 rounded-full ${item.color} group-hover/item:scale-150 transition-transform`} />
                                                <span className="text-xs font-bold text-slate-400 group-hover/item:text-white hover:translate-x-1 transition-all uppercase tracking-widest italic">{item.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* COMMUNITY */}
                        <div className="relative group/nav px-2 h-full flex items-center">
                            <button className="flex items-center gap-1.5 text-[13px] font-bold text-slate-400 group-hover/nav:text-white transition-colors py-2 uppercase tracking-wide">
                                Community
                                <ChevronRight className="w-3.5 h-3.5 rotate-90 transition-transform group-hover/nav:-rotate-90" />
                            </button>
                            <div className="absolute top-full right-0 w-[600px] bg-slate-900/95 border border-white/5 rounded-2xl p-6 opacity-0 translate-y-2 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:translate-y-0 group-hover/nav:pointer-events-auto transition-all shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] backdrop-blur-2xl z-[60] flex gap-8">
                                <div className="w-1/2 flex flex-col pt-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 border-b border-white/5 pb-2">Get Involved</span>
                                    <div className="space-y-4">
                                        {[
                                            { title: 'City News', desc: 'Global Neural SDK updates.', target: 'grants' },
                                            { title: 'Neural Podcasts', desc: 'Interviews with city architects.', target: 'vision' },
                                            { title: 'Town Hall Events', desc: 'Weekly dev syncing.', target: 'intro' },
                                            { title: 'Citizen Hub', desc: 'Community-driven resources.', target: 'guidelines' }
                                        ].map(item => (
                                            <div
                                                key={item.title}
                                                className="p-3 rounded-xl hover:bg-white/5 flex items-center gap-3 group/item cursor-pointer transition-colors border border-transparent hover:border-white/5"
                                                onClick={() => scrollToSection(item.target)}
                                            >
                                                <Users className="w-4 h-4 text-slate-500 group-hover/item:text-primary" />
                                                <div>
                                                    <span className="text-xs font-bold text-slate-400 group-hover/item:text-white uppercase tracking-tight">{item.title}</span>
                                                    <p className="text-[9px] text-slate-600 leading-none mt-1">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="w-1/2 relative group/card rounded-xl overflow-hidden aspect-[4/5] bg-slate-800 border border-white/5">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
                                    <img src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-70 group-hover/card:scale-110 transition-transform duration-700" alt="Community" />
                                    <div className="absolute top-6 left-6 z-20">
                                        <Badge className="bg-primary hover:bg-primary text-white text-[9px] font-black px-2 py-0 border-none rounded">CITY EVENT</Badge>
                                    </div>
                                    <div className="absolute bottom-6 left-6 z-20">
                                        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-1">Tech Summit</h3>
                                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest opacity-80 mb-4 flex items-center gap-2">
                                            <MapPin className="w-3 h-3 text-primary" /> KOK TOBE, ALMATY
                                        </p>
                                        <Button size="sm" onClick={() => openLink('https://forms.gle/NeuralSDKGrants')} className="w-full bg-white text-slate-950 font-black uppercase text-[10px] tracking-widest rounded-full hover:bg-slate-200">
                                            Register now <ChevronRight className="ml-1 w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </nav>
                </div>

                <div className="hidden md:flex items-center gap-6">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search or ask AI"
                            className="w-[320px] h-11 pl-11 bg-white/[0.03] border-white/10 rounded-full text-sm focus:ring-1 focus:ring-primary/40 focus:bg-white/[0.05] transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-12 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full"
                            >
                                <X className="w-3 h-3 text-muted-foreground" />
                            </button>
                        )}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-60">
                            <span className="text-[10px] font-mono tracking-tighter">⌘</span>
                            <span className="text-[10px] font-mono tracking-tighter uppercase">K</span>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-white"
                        onClick={() => openLink('https://github.com/almaty-smart-city/neural-sdk')}
                    >
                        <Github className="w-5 h-5" />
                    </Button>
                </div>
            </header>

            <div className="flex pt-16">
                {/* Sidebar */}
                <aside className={cn(
                    "fixed inset-y-0 left-0 pt-16 w-72 bg-slate-950 border-r border-white/5 z-40 transition-transform lg:translate-x-0 lg:static overflow-hidden flex flex-col",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}>
                    <div className="p-6 lg:hidden">
                        <Input
                            placeholder="Search..."
                            className="bg-white/5 border-white/10 text-xs"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <ScrollArea className="flex-1 px-6 py-4">
                        <div className="space-y-8">
                            {filteredNavigation.map((group) => (
                                <div key={group.title} className="space-y-3">
                                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-3">
                                        {group.title}
                                    </h5>
                                    <ul className="space-y-1">
                                        {group.items.map((item) => (
                                            <li key={item.id}>
                                                <button
                                                    onClick={() => scrollToSection(item.id)}
                                                    className={cn(
                                                        "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group",
                                                        activeSection === item.id
                                                            ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(var(--primary),0.2)]"
                                                            : "text-slate-400 hover:text-white hover:bg-white/5"
                                                    )}
                                                >
                                                    <item.icon className={cn(
                                                        "w-4 h-4 transition-colors",
                                                        activeSection === item.id ? "text-primary" : "text-slate-500 group-hover:text-slate-300"
                                                    )} />
                                                    {item.title}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                            {filteredNavigation.length === 0 && (
                                <div className="text-center py-10">
                                    <p className="text-xs text-slate-600 italic">No results found...</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 pb-24">
                    <div className="max-w-4xl mx-auto px-8 lg:px-16 pt-12">
                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-8">
                            <span>Docs</span>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-slate-400">{activeItem.title}</span>
                        </div>

                        {/* Banner Section (only for intro) */}
                        {activeSection === 'intro' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative rounded-3xl overflow-hidden mb-12 bg-[#0a0c14] border border-white/5 shadow-2xl group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
                                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 animate-pulse" />

                                <div className="relative p-12 flex flex-col items-center text-center">
                                    <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-2xl backdrop-blur-xl group-hover:scale-105 transition-transform duration-500">
                                        <div className="w-12 h-12 bg-primary rounded-full blur-md opacity-20 absolute" />
                                        <Cpu className="w-10 h-10 text-primary" />
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-4 italic uppercase">
                                        NEURAL <span className="text-primary">SDK</span>
                                    </h1>
                                    <p className="text-lg text-slate-400 max-w-xl font-medium leading-relaxed">
                                        The unified development kit for building decentralized urban infrastructure and neural processing nodes in Almaty.
                                    </p>
                                    <div className="flex gap-4 mt-8">
                                        <Button
                                            onClick={() => scrollToSection('install')}
                                            className="h-12 px-8 rounded-full bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-xs group"
                                        >
                                            Quick Start Guide
                                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => openLink('https://github.com/almaty-smart-city/neural-sdk')}
                                            className="h-12 px-8 rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest text-xs"
                                        >
                                            View GitHub
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Sections */}
                        <div className="space-y-24">
                            {/* Intro */}
                            <section id="intro">
                                <h2 className="text-3xl font-black tracking-tight text-white mb-6 flex items-center gap-3">
                                    <div className="w-1 h-8 bg-primary rounded-full" />
                                    Welcome to Neural SDK
                                </h2>
                                <p className="text-slate-400 text-lg leading-relaxed mb-8">
                                    Neural SDK democratizes access to city-wide sensor data and decentralized processing by eliminating the technical friction between physical hardware and digital smart city protocols.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 rounded-2xl bg-white/2 bg-gradient-to-br from-white/5 to-transparent border border-white/5 hover:border-primary/20 transition-colors">
                                        <Zap className="w-8 h-8 text-primary mb-4" />
                                        <h4 className="text-white font-bold mb-2">High-Performance</h4>
                                        <p className="text-sm text-slate-500">Sub-ms latency for city-wide data propagation and neural feedback loops.</p>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-white/2 bg-gradient-to-br from-white/5 to-transparent border border-white/5 hover:border-secondary/20 transition-colors">
                                        <Shield className="w-8 h-8 text-secondary mb-4" />
                                        <h4 className="text-white font-bold mb-2">Secure by Default</h4>
                                        <p className="text-sm text-slate-500">Every packet signed by metamorphic keys and end-to-end neural encryption.</p>
                                    </div>
                                </div>
                            </section>

                            {/* Vision */}
                            <section id="vision">
                                <h2 className="text-3xl font-black tracking-tight text-white mb-6 flex items-center gap-3">
                                    <div className="w-1 h-8 bg-primary rounded-full" />
                                    Our Vision
                                </h2>
                                <p className="text-slate-400 text-lg leading-relaxed mb-6">
                                    Our vision is to transform Almaty into a Living Organism. A city where every street, building, and vehicle contributes to a collective digital consciousness, optimized for efficiency, safety, and human well-being.
                                </p>
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 mb-8">
                                    <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                                        The Neural Foundation
                                    </h4>
                                    <p className="text-sm text-slate-500 leading-relaxed italic">
                                        "We believe that by 2030, city infrastructure won't just be passive steel and concrete, but an active participant in human life—predicting needs before they arise and reacting to emergencies in milliseconds."
                                    </p>
                                </div>
                            </section>

                            {/* What we are building */}
                            <section id="what-is">
                                <h2 className="text-3xl font-black tracking-tight text-white mb-6 flex items-center gap-3">
                                    <div className="w-1 h-8 bg-pink-500 rounded-full" />
                                    What we are building
                                </h2>
                                <p className="text-slate-400 text-lg leading-relaxed mb-8">
                                    Neural SDK is more than a library; it's a bridge to Almaty's digital twin. We are constructing three core layers:
                                </p>
                                <div className="space-y-6">
                                    {[
                                        { title: 'The P2P Neural Layer', desc: 'A decentralized network of thousands of edge nodes processing city data in real-time without central bottlenecks.' },
                                        { title: 'Dynamic Digital Twins', desc: 'Every physical object in Almaty (buses, sensors, lights) has a digital representation that reflects its state instantly.' },
                                        { title: 'Metamorphic Security', desc: 'A security protocol where encryption keys evolve based on city-wide environmental factors, making them impossible to harvest.' }
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                                            <div className="text-primary font-black text-xl italic opacity-40">0{idx + 1}</div>
                                            <div>
                                                <h4 className="text-white font-bold mb-1 tracking-tight">{item.title}</h4>
                                                <p className="text-sm text-slate-500 leading-snug">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Installation */}
                            <section id="install">
                                <h2 className="text-3xl font-black tracking-tight text-white mb-6 flex items-center gap-3">
                                    <div className="w-1 h-8 bg-orange-500 rounded-full" />
                                    Installation
                                </h2>
                                <p className="text-slate-400 mb-6">Install our core package via your preferred package manager:</p>
                                <div className="group relative">
                                    <div className="absolute inset-0 bg-primary/20 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity" />
                                    <div className="relative bg-[#0d1117] border border-white/10 rounded-2xl p-6 font-mono text-sm overflow-hidden">
                                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                                            <div className="flex gap-1.5">
                                                <div className="w-3 h-3 rounded-full bg-red-500/20" />
                                                <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                                                <div className="w-3 h-3 rounded-full bg-green-500/20" />
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard('npm install @almaty/neural-sdk', 'npm')}
                                                className="text-slate-500 hover:text-white transition-colors"
                                            >
                                                {copiedId === 'npm' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <div className="text-primary-foreground/90">
                                            <span className="text-primary">$</span> <span className="text-slate-300">npm install</span> <span className="text-orange-400">@almaty/neural-sdk</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Authentication */}
                            <section id="auth">
                                <h2 className="text-3xl font-black tracking-tight text-white mb-6 flex items-center gap-3">
                                    <div className="w-1 h-8 bg-blue-500 rounded-full" />
                                    Authentication
                                </h2>
                                <p className="text-slate-400 mb-6">Initialize the SDK with your Citizen Dev ID and Node Secret. This establishes a secure handshake with the nearest edge node:</p>
                                <div className="relative bg-[#0d1117] border border-white/10 rounded-2xl p-6 font-mono text-sm mb-8">
                                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                                        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">JavaScript / TypeScript</div>
                                        <button
                                            onClick={() => copyToClipboard(`import { NeuralClient } from '@almaty/neural-sdk';\n\nconst client = new NeuralClient({\n  apiKey: process.env.NEURAL_API_KEY,\n  nodeSecret: 'shhh_node_ident_v5'\n});`, 'js')}
                                            className="text-slate-500 hover:text-white transition-colors"
                                        >
                                            {copiedId === 'js' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <pre className="text-slate-300">
                                        <code>{`import { NeuralClient } from '@almaty/neural-sdk';

const client = new NeuralClient({
  apiKey: process.env.NEURAL_API_KEY,
  nodeSecret: 'shhh_node_ident_v5'
});`}</code>
                                    </pre>
                                </div>
                                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-4">
                                    <Shield className="w-5 h-5 text-blue-500 shrink-0" />
                                    <p className="text-xs text-blue-200/80 leading-relaxed">
                                        <strong>Pro Tip:</strong> Never expose your <code>nodeSecret</code> on the client side. Use environment variables or a secure key management system.
                                    </p>
                                </div>
                            </section>

                            {/* API Keys */}
                            <section id="api-keys">
                                <h2 className="text-3xl font-black tracking-tight text-white mb-6 flex items-center gap-3">
                                    <div className="w-1 h-8 bg-yellow-500 rounded-full" />
                                    API Keys
                                </h2>
                                <p className="text-slate-400 mb-6 font-medium">
                                    To interact with the city's neural layer, you need a valid API key with appropriate permissions.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                    {[
                                        { title: 'Eco Read', scope: 'readonly', color: 'text-green-500' },
                                        { title: 'Sensor Write', scope: 'write', color: 'text-orange-500' },
                                        { title: 'Admin Logic', scope: 'full', color: 'text-red-500' }
                                    ].map(scope => (
                                        <div key={scope.title} className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${scope.color} mb-1 block`}>{scope.title}</span>
                                            <code className="text-[10px] text-slate-500 font-mono">{scope.scope}</code>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    You can generate and revoke keys in the <a href="/dev-portal" className="text-primary hover:underline font-bold italic">Citizen Dev Portal</a>. Each key is rate-limited based on your developer tier.
                                </p>
                            </section>

                            {/* Neural API */}
                            <section id="neural-api">
                                <h2 className="text-3xl font-black tracking-tight text-white mb-6 flex items-center gap-3">
                                    <div className="w-1 h-8 bg-red-500 rounded-full" />
                                    Neural API
                                </h2>
                                <p className="text-slate-400 mb-8 leading-relaxed">
                                    The core API allows you to submit urban problems for neural processing and query the state of the city's digital twin.
                                </p>

                                <div className="space-y-8">
                                    <div>
                                        <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                            <div className="px-2 py-0.5 rounded bg-green-500/20 text-green-500 text-[10px] font-black uppercase">POST</div>
                                            <span className="text-sm tracking-tight">/v1/neural/process</span>
                                        </h4>
                                        <p className="text-sm text-slate-500 mb-4">Submit a city-state change for neural consensus.</p>
                                        <div className="bg-[#0d1117] rounded-xl p-6 border border-white/5 font-mono text-xs">
                                            <div className="text-slate-400 mb-2">// Request Body</div>
                                            <pre className="text-slate-300">
                                                {`{
  "layer": "traffic_flow",
  "vector": [0.45, -0.12, 0.88],
  "priority": "emergency_low"
}`}
                                            </pre>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                            <div className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-500 text-[10px] font-black uppercase">GET</div>
                                            <span className="text-sm tracking-tight">/v1/network/integrity</span>
                                        </h4>
                                        <p className="text-sm text-slate-500 mb-4">Check the decentralized health of the metropolitan node cluster.</p>
                                    </div>
                                </div>
                            </section>

                            {/* Sensors Section */}
                            <section id="sensors">
                                <h2 className="text-3xl font-black tracking-tight text-white mb-6 flex items-center gap-3">
                                    <div className="w-1 h-8 bg-purple-500 rounded-full" />
                                    City Sensor Data
                                </h2>
                                <p className="text-slate-400 mb-8">
                                    Access real-time streams from over 15,000 IoT sensors distributed across Almaty, including air quality meters, traffic cameras, and noise level sensors.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/2 border border-white/5 group hover:border-primary/30 transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                                            <Globe className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-sm mb-1 italic uppercase tracking-tight">Environmental</h4>
                                            <p className="text-slate-500 text-[11px] leading-relaxed">CO2, PM2.5, and humidity data with 5s resolution.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/2 border border-white/5 group hover:border-orange-500/30 transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0 group-hover:bg-orange-500/20 transition-colors">
                                            <Terminal className="w-5 h-5 text-orange-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-sm mb-1 italic uppercase tracking-tight">Transportation</h4>
                                            <p className="text-slate-500 text-[11px] leading-relaxed">Anonymized vehicle count and speed data.</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Solutions Showcase */}
                            <section id="solutions">
                                <h2 className="text-3xl font-black tracking-tight text-white mb-6 flex items-center gap-3">
                                    <div className="w-1 h-8 bg-cyan-500 rounded-full" />
                                    Solutions Showcase
                                </h2>
                                <p className="text-slate-400 mb-8 leading-relaxed">
                                    Real-world implementations of Neural SDK in Almaty. These modules are available for city-wide deployment.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { title: 'Smart Traffic', desc: 'Dynamic intersection control using neural feedback loops to reduce congestion by 30%.', color: 'border-blue-500/30' },
                                        { title: 'Air Quality', desc: 'Metropolitan-scale pollution vector tracking with predictive dispersal models.', color: 'border-green-500/30' },
                                        { title: 'Public Safety', desc: 'Decentralized emergency response mesh connecting first responders in real-time.', color: 'border-red-500/30' },
                                        { title: 'Energy Grid', desc: 'Peer-to-peer energy load balancing for district-level microgrids.', color: 'border-yellow-500/30' }
                                    ].map((solution, idx) => (
                                        <div key={idx} className={cn("p-6 rounded-2xl bg-white/[0.02] border hover:bg-white/[0.04] transition-all group", solution.color)}>
                                            <h4 className="text-white font-black italic uppercase tracking-tighter mb-2 group-hover:text-primary transition-colors">{solution.title}</h4>
                                            <p className="text-xs text-slate-500 leading-relaxed">{solution.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Network Infrastructure */}
                            <section id="network">
                                <h2 className="text-3xl font-black tracking-tight text-white mb-6 flex items-center gap-3">
                                    <div className="w-1 h-8 bg-indigo-500 rounded-full" />
                                    Network Infrastructure
                                </h2>
                                <p className="text-slate-400 mb-8 leading-relaxed">
                                    The Neural Network is maintained by a distributed cluster of citizen-operated nodes and city-grade validators.
                                </p>
                                <div className="space-y-6">
                                    <div className="p-8 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
                                        <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-indigo-500" />
                                            Becoming a Validator
                                        </h4>
                                        <p className="text-sm text-slate-400 mb-4">
                                            Validators ensure the integrity of the neural layer by processing city telemetry and participating in consensus. Requires a minimum of 100 CITIZEN-XP.
                                        </p>
                                        <ul className="text-xs text-slate-500 space-y-2 mb-6">
                                            <li className="flex items-center gap-2 italic"> <div className="w-1 h-1 rounded-full bg-indigo-500" /> Minimum 16-core Neural Processing Unit (NPU)</li>
                                            <li className="flex items-center gap-2 italic"> <div className="w-1 h-1 rounded-full bg-indigo-500" /> 1Gbps dedicated metropolitan uplink</li>
                                            <li className="flex items-center gap-2 italic"> <div className="w-1 h-1 rounded-full bg-indigo-500" /> 99.99% uptime commitment</li>
                                        </ul>
                                        <Button variant="outline" size="sm" className="rounded-full border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 uppercase text-[10px] font-black tracking-widest">
                                            View Requirements
                                        </Button>
                                    </div>
                                </div>
                            </section>

                            {/* Grants */}
                            <section id="grants">
                                <div className="p-12 rounded-[2rem] bg-gradient-to-br from-primary/20 via-primary/5 to-secondary/20 border border-primary/20 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8">
                                        <Rocket className="w-24 h-24 text-primary opacity-20" />
                                    </div>
                                    <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">Ecosystem Grants</h2>
                                    <p className="text-slate-400 max-w-xl mb-8 font-medium leading-relaxed">
                                        Building the next generation of Almaty's digital infrastructure? We provide funding, technical support, and early access to experimental APIs for impactful projects.
                                    </p>
                                    <Button
                                        onClick={() => openLink('https://forms.gle/NeuralSDKGrants')}
                                        className="h-12 px-10 rounded-full bg-white text-slate-950 hover:bg-slate-200 font-black uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20"
                                    >
                                        Apply for Grant
                                    </Button>
                                </div>
                            </section>

                            {/* Partnership Guidelines */}
                            <section id="guidelines">
                                <h2 className="text-3xl font-black tracking-tight text-white mb-6 flex items-center gap-3">
                                    <div className="w-1 h-8 bg-green-500 rounded-full" />
                                    Partnership Guidelines
                                </h2>
                                <p className="text-slate-400 mb-8">
                                    We partner with companies and research groups that share our commitment to open, privacy-preserving smart city technology.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h4 className="text-white font-bold flex items-center gap-2 italic uppercase text-xs tracking-widest">
                                            <Shield className="w-4 h-4 text-primary" />
                                            Ethical AI Usage
                                        </h4>
                                        <p className="text-xs text-slate-500 leading-relaxed">All processing must be anonymized at the edge. No PII (Personally Identifiable Information) can be stored in the neural layer.</p>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-white font-bold flex items-center gap-2 italic uppercase text-xs tracking-widest">
                                            <Globe className="w-4 h-4 text-secondary" />
                                            Open Data Standards
                                        </h4>
                                        <p className="text-xs text-slate-500 leading-relaxed">We require partners to contribute back to the public data pool where appropriate to benefit the entire citizen community.</p>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Pagination */}
                        <div className="mt-24 pt-8 border-t border-white/10 flex items-center justify-between">
                            {allItems.findIndex(i => i.id === activeSection) > 0 ? (
                                <button
                                    onClick={() => handlePagination('prev')}
                                    className="flex flex-col items-start gap-2 group text-left"
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Previous</span>
                                    <span className="flex items-center gap-2 text-white font-bold group-hover:text-primary transition-colors">
                                        <ChevronRight className="w-4 h-4 rotate-180" />
                                        {allItems[allItems.findIndex(i => i.id === activeSection) - 1]?.title}
                                    </span>
                                </button>
                            ) : <div />}

                            {allItems.findIndex(i => i.id === activeSection) < allItems.length - 1 ? (
                                <button
                                    onClick={() => handlePagination('next')}
                                    className="flex flex-col items-end gap-2 group text-right"
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Next</span>
                                    <span className="flex items-center gap-2 text-white font-bold group-hover:text-primary transition-colors">
                                        {allItems[allItems.findIndex(i => i.id === activeSection) + 1]?.title}
                                        <ChevronRight className="w-4 h-4" />
                                    </span>
                                </button>
                            ) : <div />}
                        </div>
                    </div>
                </main>

                {/* Right Sidebar - TOC */}
                <aside className="hidden xl:block w-64 pt-16 sticky top-16 h-[calc(100vh-64px)] overflow-hidden">
                    <div className="py-12 px-8 space-y-6">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500">On this page</h5>
                        <ScrollArea className="h-[calc(100vh-200px)]">
                            <ul className="space-y-4">
                                {[
                                    { id: 'intro', title: 'Welcome' },
                                    { id: 'vision', title: 'Vision' },
                                    { id: 'what-is', title: 'What we build' },
                                    { id: 'install', title: 'Installation' },
                                    { id: 'auth', title: 'Authentication' },
                                    { id: 'api-keys', title: 'API Keys' },
                                    { id: 'neural-api', title: 'Neural API' },
                                    { id: 'sensors', title: 'Sensor Data' },
                                    { id: 'solutions', title: 'Solutions' },
                                    { id: 'network', title: 'Network' },
                                    { id: 'grants', title: 'Grants' },
                                    { id: 'guidelines', title: 'Partnerships' },
                                ].map((item) => (
                                    <li key={item.id}>
                                        <button
                                            onClick={() => scrollToSection(item.id)}
                                            className={cn(
                                                "text-xs font-bold uppercase transition-colors hover:text-white block w-full text-left",
                                                activeSection === item.id ? "text-primary border-l-2 border-primary pl-4" : "text-slate-500 pl-4 border-l-2 border-transparent"
                                            )}
                                        >
                                            {item.title}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </ScrollArea>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Docs;
