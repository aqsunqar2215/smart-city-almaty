import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export const VisionConsole = () => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
            setResult(null);
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;
        setIsAnalyzing(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const resp = await fetch('http://localhost:8000/api/ai/vision/analyze', {
                method: 'POST',
                body: formData,
            });

            if (resp.ok) {
                const data = await resp.json();
                setResult(data);
                toast.success("AI Analysis Complete");
            } else {
                toast.error("Analysis Failed");
            }
        } catch (e) {
            toast.error("Connection Error");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <Card className="border-2 border-primary/20 bg-slate-950/40 backdrop-blur-xl overflow-hidden h-full">
            <CardHeader className="bg-primary/5 border-b border-primary/10 px-4 py-3">
                <CardTitle className="text-xs font-black uppercase italic tracking-widest flex items-center gap-2 text-primary">
                    <Camera className="h-4 w-4" />
                    Urban Vision AI
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <div className="flex flex-col items-center justify-center gap-4">
                    {!preview ? (
                        <label className="w-full h-40 border-2 border-dashed border-primary/20 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary/5 hover:border-primary/40 transition-all group">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Upload className="h-5 w-5 text-primary" />
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-bold text-slate-200">Neural Visual Link</p>
                                <p className="text-[9px] text-muted-foreground uppercase font-mono tracking-tighter mt-1">Upload Issue Data</p>
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                    ) : (
                        <div className="w-full space-y-4">
                            <div className="relative rounded-xl overflow-hidden border border-primary/20 h-40 group">
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="h-8 rounded-lg text-[10px] font-bold"
                                        onClick={() => { setFile(null); setPreview(null); setResult(null); }}
                                    >
                                        Remove Data
                                    </Button>
                                </div>
                            </div>

                            {!result && (
                                <Button
                                    className="w-full h-10 rounded-lg bg-primary hover:bg-primary/80 shadow-glow-primary text-xs font-bold uppercase tracking-widest"
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing}
                                >
                                    {isAnalyzing ? (
                                        <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Analyzing...</>
                                    ) : (
                                        "Initiate Inspection"
                                    )}
                                </Button>
                            )}
                        </div>
                    )}

                    <AnimatePresence>
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                        <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Identified</span>
                                    </div>
                                    <Badge className="bg-emerald-500/20 text-emerald-500 border-none text-[8px] font-bold">
                                        {Math.round(result.confidence * 100)}% CONFIDENCE
                                    </Badge>
                                </div>

                                <div className="space-y-0.5">
                                    <p className="text-[8px] text-muted-foreground uppercase font-mono font-bold">Anomaly Category</p>
                                    <p className="text-[13px] font-black capitalize text-slate-100 italic tracking-tight">{result.category}</p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[8px] text-muted-foreground uppercase font-mono font-bold">AI Diagnosis</p>
                                    <p className="text-[11px] leading-relaxed text-slate-300 italic">{result.report_summary}</p>
                                </div>

                                <Button
                                    variant="outline"
                                    className="w-full h-8 rounded-lg border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 text-[9px] font-bold uppercase tracking-widest transition-all"
                                    onClick={() => toast.success("Synchronized with Almaty City OS Cluster")}
                                >
                                    Dispatch Repair Unit
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </CardContent>
        </Card>
    );
};
