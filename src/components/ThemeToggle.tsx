import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
    const { theme, actualTheme, setTheme, toggleTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative w-10 h-10 rounded-full glass hover:bg-muted transition-all group"
                >
                    <Sun className={`h-5 w-5 transition-all duration-500 ${actualTheme === 'dark' ? 'rotate-90 scale-0' : 'rotate-0 scale-100'} absolute`} />
                    <Moon className={`h-5 w-5 transition-all duration-500 ${actualTheme === 'dark' ? 'rotate-0 scale-100' : '-rotate-90 scale-0'} absolute`} />
                    <span className="sr-only">Toggle theme</span>

                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                            background: actualTheme === 'dark'
                                ? 'radial-gradient(circle, rgba(250, 204, 21, 0.2) 0%, transparent 70%)'
                                : 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)'
                        }}
                    />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card border-border">
                <DropdownMenuItem onClick={() => setTheme('light')} className="cursor-pointer hover:bg-muted">
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light</span>
                    {theme === 'light' && <span className="ml-auto text-primary">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')} className="cursor-pointer hover:bg-muted">
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark</span>
                    {theme === 'dark' && <span className="ml-auto text-primary">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')} className="cursor-pointer hover:bg-muted">
                    <Monitor className="mr-2 h-4 w-4" />
                    <span>System</span>
                    {theme === 'system' && <span className="ml-auto text-primary">✓</span>}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

// Simple toggle button version
export const ThemeToggleSimple: React.FC = () => {
    const { actualTheme, toggleTheme } = useTheme();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="relative w-10 h-10 rounded-full overflow-hidden magnetic-btn"
        >
            <div className="relative w-full h-full flex items-center justify-center">
                <Sun className={`h-5 w-5 text-yellow-500 transition-all duration-500 absolute ${actualTheme === 'dark' ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'}`} />
                <Moon className={`h-5 w-5 text-blue-400 transition-all duration-500 absolute ${actualTheme === 'dark' ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`} />
            </div>

            {/* Background transition */}
            <div
                className={`absolute inset-0 transition-all duration-500 -z-10 ${actualTheme === 'dark'
                    ? 'bg-gradient-to-br from-slate-800 to-slate-900'
                    : 'bg-gradient-to-br from-amber-100 to-orange-100'
                    }`}
            />
        </Button>
    );
};

export default ThemeToggle;
