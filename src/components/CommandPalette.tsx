import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import {
    BarChart3,
    Home,
    User,
    Grid3x3,
    MapPin,
    AlertTriangle,
    Bus,
    Search,
    Settings,
    ShieldAlert,
    Boxes
} from 'lucide-react';
import { useSoundEffects } from '@/hooks/useSoundEffects';

export const CommandPalette = () => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { playNotification, playSuccess, playHover } = useSoundEffects();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => {
                    if (!open) playNotification();
                    return !open;
                });
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, [playNotification]);

    const runCommand = (command: () => void) => {
        playSuccess();
        setOpen(false);
        command();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-background/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <Command
                className="w-full max-w-2xl bg-popover/80 backdrop-blur-2xl border border-border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-300"
                label="Global Command Palette"
                onKeyDown={(e) => {
                    if (e.key === 'Escape') setOpen(false);
                }}
            >
                <div className="flex items-center border-b border-border px-4 py-3">
                    <Search className="w-4 h-4 text-muted-foreground mr-3" />
                    <Command.Input
                        autoFocus
                        placeholder="Search city modules, services or citizens..."
                        className="flex-1 bg-transparent border-none outline-none text-foreground text-sm placeholder:text-muted-foreground"
                    />
                    <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        <span className="text-xs">ESC</span>
                    </kbd>
                </div>

                <Command.List className="max-h-[350px] overflow-y-auto p-2 custom-scrollbar">
                    <Command.Empty className="py-6 text-center text-sm text-muted-foreground italic">No results found for your query.</Command.Empty>

                    <Command.Group heading="City Modules" className="px-2 py-1 text-[10px] font-black uppercase tracking-widest text-primary/60">
                        <Item icon={Grid3x3} label="City OS Dashboard" onSelect={() => runCommand(() => navigate('/'))} />
                        <Item icon={MapPin} label="Eco Routing System" onSelect={() => runCommand(() => navigate('/eco-routing'))} />
                        <Item icon={BarChart3} label="Urban Analytics" onSelect={() => runCommand(() => navigate('/analytics'))} />
                        <Item icon={Bus} label="Public Transport" onSelect={() => runCommand(() => navigate('/transport'))} />
                        <Item icon={Boxes} label="Ecosystem" onSelect={() => runCommand(() => navigate('/ecosystem'))} />
                    </Command.Group>

                    <Command.Separator className="h-px bg-border my-2" />

                    <Command.Group heading="Citizen Services" className="px-2 py-1 text-[10px] font-black uppercase tracking-widest text-primary/60">
                        <Item icon={User} label="Digital Citizen ID" onSelect={() => runCommand(() => navigate('/profile'))} />
                        <Item icon={AlertTriangle} label="Emergency Services" onSelect={() => runCommand(() => navigate('/emergency'))} />
                        <Item icon={ShieldAlert} label="Administrative Panel" onSelect={() => runCommand(() => navigate('/admin'))} />
                    </Command.Group>

                    <Command.Separator className="h-px bg-border my-2" />

                    <Command.Group heading="System" className="px-2 py-1 text-[10px] font-black uppercase tracking-widest text-primary/60">
                        <Item icon={Settings} label="Interface Settings" onSelect={() => runCommand(() => navigate('/settings'))} />
                    </Command.Group>
                </Command.List>

                <div className="border-t border-border px-4 py-2 flex items-center justify-between bg-muted/20">
                    <p className="text-[10px] text-muted-foreground">ALMATY_SMART_PALETTE v1.0.2</p>
                    <div className="flex gap-2">
                        <span className="text-[10px] text-primary font-bold">↑↓ to navigate</span>
                        <span className="text-[10px] text-primary font-bold">↵ to select</span>
                    </div>
                </div>
            </Command>
        </div>
    );
};

const Item = ({ icon: Icon, label, onSelect }: { icon: any, label: string, onSelect: () => void }) => {
    const { playHover } = useSoundEffects();
    return (
        <Command.Item
            onSelect={onSelect}
            onMouseEnter={() => playHover()}
            className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer aria-selected:bg-primary/20 aria-selected:text-primary transition-colors group"
        >
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-aria-selected:bg-primary/30 transition-colors">
                <Icon className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium tracking-tight">{label}</span>
            <ChevronRight className="ml-auto w-4 h-4 opacity-0 group-aria-selected:opacity-100 transition-opacity" />
        </Command.Item>
    );
};

const ChevronRight = ({ className }: { className?: string }) => (
    <svg className={className} width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.1584 3.13597C5.96314 3.33123 5.96314 3.64781 6.1584 3.84307L9.81532 7.5L6.1584 11.1569C5.96314 11.3522 5.96314 11.6688 6.1584 11.864C6.35366 12.0593 6.67024 12.0593 6.8655 11.864L10.876 7.85355C11.0712 7.65829 11.0712 7.34171 10.876 7.14645L6.8655 3.13597C6.67024 2.94071 6.35366 2.94071 6.1584 3.13597Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
);
