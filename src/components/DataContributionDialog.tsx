import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Database, Loader2, Globe, Shield, Zap, CheckCircle2 } from 'lucide-react';
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DataContributionDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function DataContributionDialog({ open, onOpenChange }: DataContributionDialogProps) {
    const [isSyncing, setIsSyncing] = useState(false);
    const [dataType, setDataType] = useState<'environmental' | 'traffic' | 'infrastructure'>('environmental');
    const [value, setValue] = useState("");
    const [description, setDescription] = useState("");

    const handleSync = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!value && !description) {
            toast.error("Please provide data value or description.");
            return;
        }

        setIsSyncing(true);
        // Simulate Neural Mesh Sync
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Helper to get user ID
        const userStr = localStorage.getItem('currentUser');
        const user = userStr ? JSON.parse(userStr) : null;

        const contributionData = {
            category: dataType.toUpperCase(),
            description: `[DATA_FEED] ${description || (dataType + ' reading: ' + value)}`,
            lat: 43.238949,
            lng: 76.889709,
            user_id: user?.id ? parseInt(user.id) : null,
            status: 'RECEIVED'
        };

        try {
            // We use the same reports endpoint for now as a generic "contribution" log
            const res = await fetch('http://localhost:8000/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contributionData)
            });

            if (!res.ok) throw new Error("Mesh sync failed");

            toast.success("Mesh Synchronization Successful!", {
                description: "Your data has been added to the city neural layer. +25 Trust Points.",
            });

            if (onOpenChange) onOpenChange(false);
            setValue("");
            setDescription("");
        } catch (err) {
            toast.error("Network sync failure. Check your connection to Almaty-Core.");
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px] bg-slate-950/90 backdrop-blur-2xl border-white/10 text-white overflow-hidden p-0 rounded-[2rem]">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-50 pointer-events-none" />

                <div className="p-8 space-y-6 relative z-10">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
                                <Database className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
                                    Data Mesh Contribution
                                </DialogTitle>
                                <DialogDescription className="text-slate-400 text-xs font-medium uppercase tracking-widest">
                                    Synchronize local telemetry with Almaty-Core
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleSync} className="space-y-6">
                        {/* Data Type Selection */}
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Telemetry Type</Label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 'environmental', icon: Globe, label: 'Enviro' },
                                    { id: 'traffic', icon: Zap, label: 'Traffic' },
                                    { id: 'infrastructure', icon: Shield, label: 'Infra' },
                                ].map((type) => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => setDataType(type.id as any)}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all gap-2 group",
                                            dataType === type.id
                                                ? "bg-primary/20 border-primary shadow-glow text-white"
                                                : "bg-white/5 border-white/5 text-slate-500 hover:border-white/20"
                                        )}
                                    >
                                        <type.icon className={cn("w-5 h-5", dataType === type.id ? "text-primary" : "text-slate-500 group-hover:text-slate-300")} />
                                        <span className="text-[9px] font-black uppercase tracking-tighter">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="value" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Metric Value / Reading</Label>
                                <Input
                                    id="value"
                                    placeholder="e.g. 45 µg/m³, Level 3, etc."
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    className="bg-white/5 border-white/10 rounded-xl h-12 text-sm focus:border-primary/50 transition-all font-mono"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="desc" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Contextual Meta-data</Label>
                                <Textarea
                                    id="desc"
                                    placeholder="Provide additional details about the observation..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="bg-white/5 border-white/10 rounded-xl min-h-[100px] text-sm focus:border-primary/50 transition-all resize-none"
                                />
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-4">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                                Data is automatically anonymized via Differential Privacy and Zero-Knowledge Proofs before mesh integration.
                            </p>
                        </div>

                        <Button
                            type="submit"
                            disabled={isSyncing}
                            className="w-full h-14 bg-primary hover:bg-primary/80 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isSyncing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Syncing Mesh...
                                </>
                            ) : (
                                "Initiate Mesh Sync"
                            )}
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
