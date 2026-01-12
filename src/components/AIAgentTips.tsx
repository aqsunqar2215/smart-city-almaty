import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Lightbulb, TrendingUp, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AIAgentTips = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['proactiveTips'],
        queryFn: async () => {
            try {
                const resp = await fetch('http://localhost:8000/api/ai/proactive');
                if (resp.ok) return resp.json();
            } catch (e) {
                console.warn("Proactive engine offline");
            }
            return { suggestions: [] };
        },
        refetchInterval: 300000, // 5 minutes
    });

    if (isLoading || !data?.suggestions || data.suggestions.length === 0) {
        // Fallback for demo if backend is initializing
        if (isLoading) return null;
        return null;
    }

    return (
        <Card className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border-indigo-500/20 overflow-hidden relative group h-full">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="h-12 w-12 text-indigo-400" />
            </div>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-400">
                    <Lightbulb className="h-4 w-4 animate-pulse text-amber-400" />
                    Neural Proactive Insights
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <AnimatePresence>
                        {data.suggestions.map((tip: string, idx: number) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-3 hover:bg-indigo-500/10 transition-colors"
                            >
                                <div className="mt-0.5 h-5 w-5 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                                    <Sparkles className="h-3 w-3 text-indigo-400" />
                                </div>
                                <p className="text-[13px] leading-relaxed text-slate-200">{tip}</p>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
                <div className="mt-6 flex items-center justify-between text-[10px] text-muted-foreground font-mono uppercase tracking-tighter pt-4 border-t border-indigo-500/10">
                    <span className="flex items-center gap-1">
                        <TrendingUp className="h-2.5 w-2.5" />
                        Live Predictive Analysis
                    </span>
                    <span className="bg-indigo-500/20 text-indigo-400 px-1.5 rounded">v3.0_Nexus</span>
                </div>
            </CardContent>
        </Card>
    );
};
