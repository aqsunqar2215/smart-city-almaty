import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Gamepad2, Users, Building2, Code2, Rocket, Shield, Cpu, Zap, Globe, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal, SpotlightCard } from '@/components/effects/InteractionEffects';
import { toast } from 'sonner';
import MessengerApp from '@/components/messenger/MessengerApp';

const Ecosystem: React.FC = () => {
    const [activeTab, setActiveTab] = useState('games');

    const handleDevSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success("Application submitted! Our neural team will review it shortly.");
    };

    return (
        <Layout>
            <div className="min-h-screen pb-20 relative">
                {/* Ambient Background */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="absolute top-[20%] left-[10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse-glow" />
                    <div className="absolute bottom-[20%] right-[10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '3s' }} />
                </div>

                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <ScrollReveal direction="down">
                        <div className="text-center mb-12">
                            <h1 className="text-5xl font-black tracking-tighter uppercase mb-4">
                                <span className="bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                                    Smart Almaty Ecosystem
                                </span>
                            </h1>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-mono uppercase tracking-widest text-xs">
                                Expanding the digital horizon through integrated neural networks and decentralized infrastructure.
                            </p>
                        </div>
                    </ScrollReveal>

                    <Tabs defaultValue="games" className="w-full" onValueChange={setActiveTab}>
                        <div className="flex justify-center mb-12">
                            <TabsList className="bg-card/40 backdrop-blur-xl border border-border/50 p-1 rounded-2xl h-auto flex flex-wrap justify-center gap-2">
                                <TabsTrigger value="games" className="rounded-xl px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300">
                                    <Gamepad2 className="w-4 h-4 mr-2" />
                                    Games
                                </TabsTrigger>
                                <TabsTrigger value="social" className="rounded-xl px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300">
                                    <Users className="w-4 h-4 mr-2" />
                                    Social Networking
                                </TabsTrigger>
                                <TabsTrigger value="building" className="rounded-xl px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300">
                                    <Building2 className="w-4 h-4 mr-2" />
                                    Building
                                </TabsTrigger>
                                <TabsTrigger value="devs" className="rounded-xl px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300">
                                    <Code2 className="w-4 h-4 mr-2" />
                                    Devs
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <AnimatePresence mode="wait">
                            <TabsContent value="games" className="mt-0">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4 }}
                                    className="flex flex-col items-center justify-center min-h-[400px] text-center"
                                >
                                    <div className="relative mb-8">
                                        <Gamepad2 className="w-24 h-24 text-primary/20 animate-pulse" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Zap className="w-12 h-12 text-primary animate-bounce" />
                                        </div>
                                    </div>
                                    <h2 className="text-4xl font-black uppercase tracking-tighter mb-2 italic">Coming Soon</h2>
                                    <p className="text-muted-foreground font-mono text-sm tracking-widest uppercase">
                                        Neural-integrated gaming experiences are being synthesized.
                                    </p>
                                </motion.div>
                            </TabsContent>

                            <TabsContent value="social" className="mt-0">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <MessengerApp />
                                </motion.div>
                            </TabsContent>

                            <TabsContent value="building" className="mt-0">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                >
                                    <SpotlightCard className="rounded-3xl border border-border/50 bg-card/40 backdrop-blur-xl p-8 card-3d">
                                        <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6">
                                            <Shield className="w-8 h-8 text-blue-400" />
                                        </div>
                                        <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Neural Cryptography</h3>
                                        <p className="text-muted-foreground leading-relaxed mb-6 font-medium">
                                            Our ecosystem utilizes advanced neural-based cryptography for end-to-end user data encryption. Every packet of information is shielded by dynamic metamorphic keys that evolve with the city's pulse.
                                        </p>
                                        <ul className="space-y-3">
                                            <li className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-primary">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                Zero-Knowledge Identity
                                            </li>
                                            <li className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-primary">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                Quantum-Resistant Vaults
                                            </li>
                                            <li className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-primary">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                Decentralized Mesh Storage
                                            </li>
                                        </ul>
                                    </SpotlightCard>

                                    <SpotlightCard className="rounded-3xl border border-border/50 bg-card/40 backdrop-blur-xl p-8 card-3d">
                                        <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6">
                                            <Cpu className="w-8 h-8 text-purple-400" />
                                        </div>
                                        <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Core Infrastructure</h3>
                                        <p className="text-muted-foreground leading-relaxed mb-6 font-medium">
                                            Building the foundation for a truly autonomous city. Our infrastructure allows for seamless integration between hardware IoT sensors and digital neural processing units.
                                        </p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-muted/30 p-4 rounded-2xl border border-border/50">
                                                <div className="text-xl font-black text-foreground mb-1">1.2ms</div>
                                                <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Latency</div>
                                            </div>
                                            <div className="bg-muted/30 p-4 rounded-2xl border border-border/50">
                                                <div className="text-xl font-black text-foreground mb-1">99.9%</div>
                                                <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Uptime</div>
                                            </div>
                                        </div>
                                    </SpotlightCard>
                                </motion.div>
                            </TabsContent>

                            <TabsContent value="devs" className="mt-0">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4 }}
                                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                                >
                                    <div className="lg:col-span-1 space-y-6">
                                        <Card className="rounded-3xl border border-border/50 bg-card/40 backdrop-blur-xl p-8 shadow-2xl">
                                            <h3 className="text-2xl font-black uppercase tracking-tight mb-4 flex items-center gap-3">
                                                <Rocket className="w-6 h-6 text-primary" />
                                                Build with us
                                            </h3>
                                            <p className="text-muted-foreground text-sm leading-relaxed mb-6 font-medium">
                                                Access our Neural API, city-wide sensor data, and secure processing nodes to build the next generation of urban applications.
                                            </p>
                                            <div className="space-y-4">
                                                <a
                                                    href="/docs"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-4 rounded-2xl bg-muted/20 border border-border/50 flex items-center gap-4 group hover:bg-muted/30 transition-colors cursor-pointer"
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                                        <Code2 className="w-5 h-5 text-orange-400" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-black uppercase tracking-widest opacity-50">Docs</div>
                                                        <div className="text-sm font-bold uppercase">Neural SDK</div>
                                                    </div>
                                                </a>
                                                <div className="p-4 rounded-2xl bg-muted/20 border border-border/50 flex items-center gap-4 group hover:bg-muted/30 transition-colors cursor-pointer">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                                        <MessageSquare className="w-5 h-5 text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-black uppercase tracking-widest opacity-50">Community</div>
                                                        <div className="text-sm font-bold uppercase">Dev Discord</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>

                                    <div className="lg:col-span-2">
                                        <Card className="rounded-3xl border border-border/50 bg-card/40 backdrop-blur-xl p-8 shadow-2xl card-3d transition-all duration-500">
                                            <CardHeader className="p-0 mb-8">
                                                <CardTitle className="text-2xl font-black uppercase tracking-tight">Application Form</CardTitle>
                                                <CardDescription className="font-mono text-xs uppercase tracking-widest">Submit your project proposal for the ecosystem grant.</CardDescription>
                                            </CardHeader>
                                            <form onSubmit={handleDevSubmit} className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Developer Name</label>
                                                        <Input placeholder="Enter your name" className="rounded-xl h-12 bg-background/50 border-border/50 focus:ring-primary focus:border-primary" required />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Project Name</label>
                                                        <Input placeholder="What are you building?" className="rounded-xl h-12 bg-background/50 border-border/50 focus:ring-primary focus:border-primary" required />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Project Description</label>
                                                    <Textarea placeholder="Explain your vision..." className="rounded-2xl min-h-[120px] bg-background/50 border-border/50 focus:ring-primary focus:border-primary resize-none" required />
                                                </div>
                                                <Button type="submit" className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all active:scale-95 group">
                                                    Submit Application
                                                    <Rocket className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                </Button>
                                            </form>
                                        </Card>
                                    </div>
                                </motion.div>
                            </TabsContent>
                        </AnimatePresence>
                    </Tabs>
                </div>
            </div>
        </Layout>
    );
};

export default Ecosystem;
