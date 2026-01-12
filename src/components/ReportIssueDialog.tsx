import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Loader2, Upload, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

interface ReportIssueDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    showTrigger?: boolean;
}

export function ReportIssueDialog({ open, onOpenChange, showTrigger = true }: ReportIssueDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = open !== undefined ? open : internalOpen;
    const setIsOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<null | { severity: string; type: string }>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [description, setDescription] = useState("");

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                analyzeImage();
            };
            reader.readAsDataURL(file);
        }
    };

    const analyzeImage = async () => {
        setIsAnalyzing(true);
        // Simulate AI Analysis
        await new Promise(resolve => setTimeout(resolve, 1500));
        setAnalysisResult({
            severity: "High",
            type: "Infrastructure Issue"
        });
        setIsAnalyzing(false);
        toast.success("AI Analysis Complete: Issue Detected");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!analysisResult && !description) {
            toast.error("Please provide a description or a photo.");
            return;
        }

        // Helper to get user ID
        const userStr = localStorage.getItem('currentUser');
        const user = userStr ? JSON.parse(userStr) : null;

        // Backend Payload
        const reportData = {
            category: analysisResult?.type || "Manual Citizen Report",
            description: description || "Reported via Smart City App",
            lat: 43.238949,
            lng: 76.889709,
            image_url: imagePreview || "placeholder.jpg",
            user_id: user?.id ? parseInt(user.id) : null
        };

        try {
            const res = await fetch('http://localhost:8000/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reportData)
            });
            if (!res.ok) throw new Error("Server error");

            toast.success("Report submitted successfully!");
            setIsOpen(false);
            setAnalysisResult(null);
            setImagePreview(null);
            setDescription("");
        } catch (err) {
            toast.error("Failed to submit report. Server might be offline.");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {showTrigger && (
                <DialogTrigger asChild>
                    <Button variant="destructive" className="gap-2 shadow-lg hover:shadow-red-500/20 transition-all">
                        <AlertTriangle className="w-4 h-4" />
                        Report Issue (AI)
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px] bg-background/80 backdrop-blur-xl border-border">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Camera className="w-5 h-5 text-primary" />
                        AI Issue Reporter
                    </DialogTitle>
                    <DialogDescription>
                        Upload a photo of a city problem or describe it. Our AI will help route it.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="picture">Evidence Photo (Optional)</Label>
                        <div className="flex items-center gap-2">
                            <input id="picture" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                            <Button type="button" variant="outline" onClick={() => document.getElementById('picture')?.click()} className="w-full h-24 border-dashed relative overflow-hidden group">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                                ) : (
                                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                                        <Upload className="w-6 h-6" />
                                        <span>Click to Upload Picture</span>
                                    </div>
                                )}
                            </Button>
                        </div>
                    </div>

                    {isAnalyzing && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            AI is analyzing...
                        </div>
                    )}

                    {analysisResult && (
                        <Card className="p-3 bg-muted/50 border-primary/20">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="font-semibold text-sm text-foreground">AI Identification</p>
                                    <p className="text-xs text-muted-foreground">Type: <span className="text-foreground font-medium">{analysisResult.type}</span></p>
                                    <p className="text-xs text-muted-foreground">Severity: <span className="text-red-500 font-medium">{analysisResult.severity}</span></p>
                                </div>
                            </div>
                        </Card>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="desc">Additional Details</Label>
                        <Textarea
                            id="desc"
                            placeholder="Describe the location or problem..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={isAnalyzing}>
                        Submit Report
                    </Button>
                </form>
            </DialogContent>
        </Dialog>

    );
}
