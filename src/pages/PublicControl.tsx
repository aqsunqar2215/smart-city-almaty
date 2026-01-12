import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Users, Vote, Leaf, Construction, Paintbrush, ArrowUpCircle, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Petition {
    id: number;
    title: string;
    description: string;
    votes: number;
    category: string;
    status: string;
}

const PublicControl = () => {
    const queryClient = useQueryClient();
    const [votedId, setVotedId] = useState<number[]>([]);
    const [showNewPetition, setShowNewPetition] = useState(false);
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [category, setCategory] = useState("INFRASTRUCTURE");

    const { data: petitions, isLoading } = useQuery({
        queryKey: ['petitions'],
        queryFn: async () => {
            const res = await fetch('http://localhost:8000/api/petitions');
            return res.json();
        }
    });

    const voteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`http://localhost:8000/api/petitions/${id}/vote`, {
                method: 'POST'
            });
            return res.json();
        },
        onSuccess: (data, id) => {
            queryClient.invalidateQueries({ queryKey: ['petitions'] });
            setVotedId(prev => [...prev, id]);
            toast.success('Your vote has been counted!');
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            // Reusing a fetch approach since we don't have a specific petition post helper yet
            const res = await fetch('http://localhost:8000/api/petitions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to create petition");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['petitions'] });
            setShowNewPetition(false);
            setTitle("");
            setDesc("");
            toast.success("Petition submitted for verification");
        },
        onError: () => {
            toast.error("Failed to submit petition. Check your connection.");
        }
    });

    const getIcon = (category: string) => {
        switch (category) {
            case 'ECOLOGY': return <Leaf className="text-emerald-500 w-4 h-4" />;
            case 'INFRASTRUCTURE': return <Construction className="text-blue-500 w-4 h-4" />;
            case 'CULTURE': return <Paintbrush className="text-purple-500 w-4 h-4" />;
            default: return <Vote className="text-gray-500 w-4 h-4" />;
        }
    };

    const targetVotes = 2000;

    return (
        <div className="min-h-screen pb-10 relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 lg:px-8 relative z-10 pt-10 bg-background/40 backdrop-blur-2xl rounded-[3rem] border border-border/10 shadow-2xl my-10 pb-16 space-y-8 animate-in fade-in duration-700">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                            <Users className="text-primary w-10 h-10" />
                            Public Control
                        </h1>
                        <p className="text-muted-foreground mt-2">Submit and vote for city improvement initiatives • Almaty v5.0</p>
                    </div>

                    <Dialog open={showNewPetition} onOpenChange={setShowNewPetition}>
                        <DialogTrigger asChild>
                            <Button size="lg" className="rounded-xl shadow-xl hover:scale-105 transition-transform font-bold">
                                Create New Petition
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>New City Initiative</DialogTitle>
                                <DialogDescription>
                                    Propose a change for Almaty. Reach 2,000 votes for official review.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Title</label>
                                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. New park in Bostandyk" />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Category</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option value="INFRASTRUCTURE">Infrastructure</option>
                                        <option value="ECOLOGY">Ecology</option>
                                        <option value="CULTURE">Culture</option>
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Describe your idea in detail..." />
                                </div>
                            </div>
                            <Button
                                className="w-full"
                                onClick={() => createMutation.mutate({ title, description: desc, category, votes: 1 })}
                                disabled={!title || !desc || createMutation.isPending}
                            >
                                {createMutation.isPending ? "Submitting..." : "Submit Initiative"}
                            </Button>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isLoading ? (
                        Array(4).fill(0).map((_, i) => (
                            <Card key={i} className="animate-pulse h-[200px] bg-card/50" />
                        ))
                    ) : (
                        petitions?.map((petition: Petition) => (
                            <Card key={petition.id} className="group hover:border-primary/50 transition-all border-border/50 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className="mb-2 flex items-center gap-1.5 py-1 px-3">
                                            {getIcon(petition.category)}
                                            <span className="text-[10px] font-bold tracking-wider">{petition.category}</span>
                                        </Badge>
                                        <span className="text-[10px] font-mono text-muted-foreground opacity-50">INITIATIVE_#{petition.id}</span>
                                    </div>
                                    <CardTitle className="text-xl group-hover:text-primary transition-colors font-black">
                                        {petition.title}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2 mt-2 leading-relaxed">
                                        {petition.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-2">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-mono">
                                            <span className="font-black flex items-center gap-1">
                                                <ArrowUpCircle size={14} className="text-primary" />
                                                {petition.votes} VOTES
                                            </span>
                                            <span className="text-muted-foreground">{Math.round((petition.votes / targetVotes) * 100)}% PROGRESS</span>
                                        </div>
                                        <Progress value={(petition.votes / targetVotes) * 100} className="h-1 bg-muted/30" />
                                    </div>

                                    <div className="flex justify-between items-center pt-2">
                                        <div className="flex items-center gap-3">
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="w-7 h-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-black shadow-lg">
                                                        ID
                                                    </div>
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Supporters</span>
                                        </div>

                                        <Button
                                            disabled={votedId.includes(petition.id)}
                                            onClick={() => voteMutation.mutate(petition.id)}
                                            variant={votedId.includes(petition.id) ? "secondary" : "default"}
                                            className="rounded-xl px-6 font-bold shadow-lg"
                                            size="sm"
                                        >
                                            {votedId.includes(petition.id) ? (
                                                <span className="flex items-center gap-2 italic"><CheckCircle2 size={16} /> Voted</span>
                                            ) : "Support idea"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                <Card className="border-dashed border-2 bg-muted/10 border-muted-foreground/20">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shadow-inner">
                            <Vote className="text-primary w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-black">Voice of Almaty citizens</h3>
                        <p className="text-muted-foreground max-w-sm text-sm">
                            Proposals reaching 2,000 votes are automatically scheduled for the next City Council hearings.
                        </p>
                        <Button variant="link" className="font-mono text-[10px] uppercase tracking-widest opacity-60">
                            View official regulation.pdf
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PublicControl;
