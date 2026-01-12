import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, Home, User, Grid3x3, LogOut, History, Bookmark, Calendar as CalendarIcon, Trophy, MapPin, ShieldAlert, AlertTriangle, Bus, Search, Zap, Users, Activity, Boxes } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CursorGlow } from '@/components/effects/InteractionEffects';
import { CommandPalette } from '@/components/CommandPalette';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { AtmosphereToggle } from './AtmosphereToggle';
import { NeuralNexusWidget } from './NeuralNexusWidget';


export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const { playHover, playClick } = useSoundEffects();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-t-2 border-primary animate-spin" />
          <span className="font-mono text-xs uppercase tracking-widest">Initialising_Core...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const navItems = [
    { path: '/', label: 'City OS', icon: Grid3x3 },
    { path: '/eco-routing', label: 'Eco Routing', icon: MapPin },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/profile', label: 'Citizen ID', icon: User },
    { path: '/emergency', label: 'Emergency', icon: AlertTriangle },
    { path: '/transport', label: 'Transport', icon: Bus },
    { path: '/infrastructure', label: 'Safety', icon: Activity },
    { path: '/community', label: 'Community', icon: Users },
    { path: '/ecosystem', label: 'Ecosystem', icon: Boxes },
    { path: '/admin', label: 'Admin', icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen selection:bg-primary/30">
      <CommandPalette />

      {/* Floating Glass Header */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 flex justify-start lg:pl-6 pt-4",
        scrolled ? "pt-2" : "pt-6"
      )}>
        <nav className={cn(
          "mx-4 w-full max-w-[96%] px-4 py-2 rounded-2xl transition-all duration-500 flex items-center justify-between",
          scrolled
            ? "bg-background/40 backdrop-blur-2xl border border-border shadow-2xl py-2 px-6"
            : "bg-transparent border border-transparent"
        )}>
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3 font-bold text-xl group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                <Grid3x3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-tighter uppercase leading-none text-foreground">Smart Almaty</span>
                <span className="text-[9px] font-mono text-primary font-bold uppercase tracking-widest opacity-60">City_OS_v4</span>
              </div>
            </Link>

            <div className="hidden xl:flex items-center gap-1">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onMouseEnter={playHover}
                  onClick={playClick}
                  className={cn(
                    "relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all group",
                    isActive(path)
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative z-10 flex items-center gap-2"
                  >
                    <Icon className={cn("w-4 h-4 transition-transform", isActive(path) && "text-primary")} />
                    <span>{label}</span>
                  </motion.div>

                  {isActive(path) && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {isActive(path) && (
                    <motion.div
                      layoutId="nav-glow"
                      className="absolute -bottom-1 left-4 right-4 h-0.5 bg-primary rounded-full shadow-glow"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Status Widget */}
            <div className="hidden md:flex items-center gap-4 px-4 py-1.5 rounded-xl bg-muted/50 border border-border glass-banking">
              <div className="flex flex-col items-end">
                <span className="text-[8px] uppercase font-black text-muted-foreground leading-none">Trust Index</span>
                <span className="text-xs font-mono font-bold text-emerald-400">742_UX</span>
              </div>
              <div className="w-px h-6 bg-border" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase text-foreground/80">GRID_SYNCED</span>
              </div>
            </div>

            <button
              onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'k', 'ctrlKey': true }))}
              className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-muted/50 border border-border/50 text-muted-foreground hover:text-primary hover:bg-muted transition-all"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase hidden sm:block">Search</span>
              <kbd className="hidden lg:inline-flex h-4 items-center gap-1 rounded bg-muted px-1 font-mono text-[9px] font-medium opacity-100 italic">
                <span>CTRL K</span>
              </kbd>
            </button>

            <div className="w-px h-6 bg-border hidden sm:block" />

            <div className="flex items-center gap-2">
              <AtmosphereToggle />
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </nav>
      </header>

      <main className="pt-24 lg:pt-32 pb-16">
        <div className="mx-4 lg:ml-6 px-4 max-w-[96%]">
          {children}
        </div>
      </main>
      <NeuralNexusWidget />
    </div>
  );
};
