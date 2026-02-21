import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Sparkles, X, Mic, MicOff, History, Zap, TrendingUp, Wind, Car, ThermometerSun, Brain, MessageSquare, Search, Volume2, Activity, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { generateChatResponse } from '@/lib/aiEngine';
import { chatHistoryStore, userQueryStore, ChatMessage } from '@/lib/dataStore';
import { useQuery } from '@tanstack/react-query';
import { fetchWeatherData, fetchAirQualityData, fetchTrafficData } from '@/lib/sensorApi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const NeuralNexusWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [typingText, setTypingText] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    const { data: weather } = useQuery({ queryKey: ['weather'], queryFn: fetchWeatherData });
    const { data: airQuality } = useQuery({ queryKey: ['airQuality'], queryFn: fetchAirQualityData });
    const { data: traffic } = useQuery({ queryKey: ['traffic'], queryFn: fetchTrafficData });

    useEffect(() => {
        const history = chatHistoryStore.readRecent(50).reverse();
        if (history.length > 0) {
            setMessages(history);
        } else {
            const welcomeMsg: ChatMessage = {
                id: 'welcome',
                role: 'assistant',
                content: '👋 Welcome to **Neural Nexus**. I am your Almaty City AI Assistant.\n\nI can help you with:\n• **Emergency services** (101, 102, 103)\n• **Live Traffic** & optimal routes\n• **Air Quality** & detailed weather\n• **City Search** & infrastructure info\n\nHow can I assist you today?',
                timestamp: new Date().toISOString()
            };
            setMessages([welcomeMsg]);
        }
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, typingText, isThinking]);

    // Handle Speech Recognition
    useEffect(() => {
        if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'ru-RU'; // Default to Russian, but can be switched

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
                toast.error("Voice Recognition Error", { description: event.error });
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            toast.error("Speech Recognition not supported in this browser");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const typeMessage = useCallback(async (fullText: string): Promise<void> => {
        setTypingText('');
        const words = fullText.split(' ');

        for (let i = 0; i <= words.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 15 + Math.random() * 20));
            setTypingText(words.slice(0, i).join(' '));
        }
    }, []);

    const handleSend = async (overrideInput?: string) => {
        const textToSend = overrideInput || input;
        if (!textToSend.trim() || !weather || !airQuality || !traffic) return;

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: textToSend.trim(),
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        chatHistoryStore.create({ role: 'user', content: textToSend.trim() });

        setInput('');
        setIsThinking(true);

        // Artificial "Neural Processing" delay
        await new Promise(resolve => setTimeout(resolve, 1200));

        const currentHistory = messages.map(m => ({ role: m.role, content: m.content }));
        const response = await generateChatResponse(textToSend.trim(), { weather, air: airQuality, traffic }, currentHistory);

        setIsThinking(false);
        setIsTyping(true);
        await typeMessage(response.response);

        const assistantMessage: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: response.response,
            timestamp: new Date().toISOString(),
            intent: response.intent,
            confidence: response.confidence,
            source: response.source,
            processingTime: response.processingTime
        };

        setMessages(prev => [...prev, assistantMessage]);
        chatHistoryStore.create({
            role: 'assistant',
            content: response.response,
            intent: response.intent,
            confidence: response.confidence,
            source: response.source,
            processingTime: response.processingTime
        } as any);
        setTypingText('');
        setIsTyping(false);

        userQueryStore.create({
            query: textToSend.trim(),
            response: response.response,
            category: 'neural-nexus'
        });
    };

    const handleVoice = async (text: string) => {
        try {
            const resp = await fetch('http://localhost:8000/api/ai/voice/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, lang: 'en' })
            });
            if (resp.ok) {
                const blob = await resp.blob();
                const url = URL.createObjectURL(blob);
                const audio = new Audio(url);
                audio.play();
            }
        } catch (e) {
            console.error("Neural Voice synthesis failed", e);
        }
    };

    const handleReset = async () => {
        try {
            await fetch('http://localhost:8000/api/ai/clear', { method: 'POST' });
            chatHistoryStore.clear();
            const welcomeMsg: ChatMessage = {
                id: 'welcome-' + Date.now(),
                role: 'assistant',
                content: 'Neural Memory Matrix cleared. Systems restarted. 🧠👋',
                timestamp: new Date().toISOString()
            };
            setMessages([welcomeMsg]);
        } catch (e) {
            console.error("Failed to clear history", e);
        }
    };

    const quickActions = [
        { icon: Search, label: 'Services', query: "What city services are available?" },
        { icon: Car, label: 'Traffic', query: "Show current traffic status" },
        { icon: Zap, label: 'SOS', query: "Emergency contacts" },
        { icon: Wind, label: 'Eco', query: "Air quality overview" },
    ];

    return (
        <div className="fixed bottom-6 right-6 z-[100]">
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 90 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Button
                            onClick={() => setIsOpen(true)}
                            data-testid="neural-widget-open"
                            className="h-16 w-16 rounded-full shadow-glow-primary border-2 border-primary/50 bg-slate-950 p-0 group overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-secondary/30 animate-pulse" />
                            <div className="relative z-10">
                                <Brain className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-500" />
                                <span className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-500 rounded-full animate-ping" />
                            </div>
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: 50, scale: 0.9, filter: 'blur(10px)' }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    >
                        <Card className="w-[420px] h-[640px] shadow-2xl flex flex-col border-2 border-primary/30 overflow-hidden bg-slate-950/80 backdrop-blur-2xl">
                            {/* Premium Header */}
                            <CardHeader className="pb-3 border-b border-white/10 bg-gradient-to-r from-primary/20 via-slate-900 to-secondary/20 flex-shrink-0 relative overflow-hidden">
                                <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 border border-primary/50 flex items-center justify-center relative group">
                                            <Brain className="h-7 w-7 text-primary animate-pulse group-hover:scale-125 transition-transform" />
                                            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                            </div>
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-black uppercase italic tracking-tighter text-primary flex items-center gap-2">
                                                Neural Nexus
                                                <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-primary/50 text-primary bg-primary/10">
                                                    AI CORE v5.2
                                                </Badge>
                                            </CardTitle>
                                            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Global City OS Liaison</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleReset}
                                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                            title="Clear Neural Memory"
                                        >
                                            <History className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setIsOpen(false)}
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

                                {/* Messages Area */}
                                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                                    <div className="space-y-6 pb-4">
                                        {messages.map((message) => (
                                            <motion.div
                                                key={message.id}
                                                data-testid={`neural-message-${message.role}`}
                                                initial={{ opacity: 0, x: message.role === 'user' ? 20 : -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className={cn(
                                                    "flex gap-3",
                                                    message.role === 'user' ? "flex-row-reverse" : "flex-row"
                                                )}
                                            >
                                                <div className={cn(
                                                    "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-1 border",
                                                    message.role === 'assistant'
                                                        ? "bg-primary/20 border-primary/30 text-primary shadow-glow-sm"
                                                        : "bg-slate-800 border-white/10 text-white"
                                                )}>
                                                    {message.role === 'assistant' ? <Zap className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                                </div>

                                                <div className={cn(
                                                    "max-w-[80%] rounded-2xl px-4 py-3 shadow-xl",
                                                    message.role === 'user'
                                                        ? "bg-primary text-primary-foreground rounded-tr-none"
                                                        : "bg-slate-900/60 border border-white/10 rounded-tl-none backdrop-blur-md"
                                                )}>
                                                    <div className="text-sm leading-relaxed prose prose-invert max-w-none">
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                            {message.content}
                                                        </ReactMarkdown>
                                                    </div>

                                                    {message.role === 'assistant' && message.id !== 'welcome' && (
                                                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10">
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6 rounded-lg text-primary/60 hover:text-primary hover:bg-primary/20"
                                                                    onClick={() => handleVoice(message.content)}
                                                                >
                                                                    <Volume2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                                                                    <Cpu className="h-2.5 w-2.5 text-primary" />
                                                                    <span className="text-[8px] font-mono text-primary/80 uppercase">{message.source || 'neural'}</span>
                                                                </div>
                                                                {message.processingTime && (
                                                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                                                                        <Activity className="h-2.5 w-2.5 text-emerald-500" />
                                                                        <span className="text-[8px] font-mono text-emerald-400">{message.processingTime}ms</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-[8px] font-mono text-white/40">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {message.role === 'user' && (
                                                        <div className="text-[8px] mt-2 font-mono uppercase tracking-widest opacity-50 text-right">
                                                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}

                                        {/* AI Thinking Animation */}
                                        {isThinking && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="flex gap-3"
                                            >
                                                <div className="h-8 w-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mt-1">
                                                    <Brain className="h-4 w-4 text-primary animate-pulse" />
                                                </div>
                                                <div className="bg-slate-900/60 border border-primary/30 rounded-2xl rounded-tl-none px-4 py-3 min-w-[120px]">
                                                    <div className="flex gap-1.5 items-center mb-1">
                                                        <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                        <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                        <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                    </div>
                                                    <span className="text-[9px] font-black text-primary/80 uppercase tracking-widest animate-pulse">Processing...</span>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Typing Stream */}
                                        {isTyping && !isThinking && (
                                            <div className="flex gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mt-1">
                                                    <Sparkles className="h-4 w-4 text-primary animate-spin-slow" />
                                                </div>
                                                <div className="bg-slate-900/60 border border-white/10 rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%] backdrop-blur-md">
                                                    <div className="text-sm leading-relaxed prose prose-invert max-w-none">
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                            {typingText}
                                                        </ReactMarkdown>
                                                        <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-1 align-middle" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>

                                {/* Quick Actions Panel */}
                                <div className="px-4 py-3 border-t border-white/5 bg-slate-950/40 relative z-10">
                                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                        {quickActions.map((action) => (
                                            <Button
                                                key={action.label}
                                                variant="outline"
                                                size="sm"
                                                className="text-[10px] font-bold uppercase tracking-widest h-8 px-3 gap-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/20 hover:border-primary/40 rounded-full transition-all flex-shrink-0"
                                                onClick={() => handleSend(action.query)}
                                                disabled={isTyping || isThinking}
                                            >
                                                <action.icon className="h-3 w-3" />
                                                {action.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Cyber Input Area */}
                                <div className="p-4 border-t border-white/10 bg-slate-950 relative z-20">
                                    <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            handleSend();
                                        }}
                                        className="flex gap-2"
                                    >
                                        <div className="relative flex-1 group">
                                            <Input
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                data-testid="neural-widget-input"
                                                placeholder={isListening ? "Listening to Almaty..." : "Link with Neural Nexus..."}
                                                className="h-12 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-xl pl-4 pr-12 transition-all group-hover:bg-white/10"
                                                disabled={isTyping || isThinking}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={toggleListening}
                                                className={cn(
                                                    "absolute right-1 top-1 h-10 w-10 rounded-lg transition-colors",
                                                    isListening ? "text-red-500 animate-pulse bg-red-500/10" : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                )}
                                                disabled={isTyping || isThinking}
                                            >
                                                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                            </Button>
                                        </div>

                                        <Button
                                            type="submit"
                                            size="icon"
                                            data-testid="neural-widget-send"
                                            className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/80 shadow-glow-primary active:scale-95 transition-all shrink-0"
                                            disabled={!input.trim() || isTyping || isThinking}
                                        >
                                            <Send className="h-5 w-5" />
                                        </Button>
                                    </form>

                                    <div className="flex items-center justify-between mt-3 px-1">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[8px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Neural_Sync_OK</span>
                                        </div>
                                        <span className="text-[8px] font-mono font-bold text-primary uppercase tracking-widest">V5.2_ACTIVE_GRID</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
