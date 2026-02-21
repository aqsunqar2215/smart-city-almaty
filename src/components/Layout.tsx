import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, User, Grid3x3, LogOut, MapPin, ShieldAlert, AlertTriangle, Bus, Search, Users, Activity, Boxes } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CommandPalette } from '@/components/CommandPalette';
import { motion } from 'framer-motion';
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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 flex justify-start lg:pl-6 pt-2",
        scrolled ? "pt-1" : "pt-3"
      )}>
        <nav className={cn(
          "mx-4 w-full max-w-[96%] px-3 py-1.5 rounded-xl transition-all duration-500 flex items-center justify-between",
          scrolled
            ? "bg-background/90 backdrop-blur-md border border-border py-1.5 px-4"
            : "bg-transparent border border-transparent"
        )}>
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 font-bold text-xl group">
              <div className="w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center">
                <Grid3x3 className="w-4.5 h-4.5 text-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black tracking-tighter uppercase leading-none text-foreground">Smart Almaty</span>
                <span className="text-[9px] font-mono text-muted-foreground font-semibold uppercase tracking-widest">City_OS_v4</span>
              </div>
            </Link>

            <div className="hidden xl:flex items-center gap-1.5">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onMouseEnter={playHover}
                  onClick={playClick}
                  className={cn(
                    "relative isolate flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold tracking-tight transition-all duration-200 border",
                    isActive(path)
                      ? "text-primary border-primary/30 bg-primary/10"
                      : "text-muted-foreground border-transparent hover:text-foreground hover:bg-primary/5 hover:border-primary/20"
                  )}
                >
                  <motion.div className="relative z-10 flex items-center gap-1.5">
                    <Icon className={cn("w-3.5 h-3.5", isActive(path) && "text-primary")} />
                    <span>{label}</span>
                  </motion.div>

                  {isActive(path) && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-lg bg-primary/8"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Status Widget */}
            <div className="hidden md:flex items-center gap-3 px-3 py-1 rounded-lg bg-muted/40 border border-border">
              <div className="flex flex-col items-end">
                <span className="text-[8px] uppercase font-black text-muted-foreground leading-none">Trust Index</span>
                <span className="text-xs font-mono font-semibold text-primary">742_UX</span>
              </div>
              <div className="w-px h-6 bg-border" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black uppercase text-foreground/80">GRID_SYNCED</span>
              </div>
            </div>

            <button
              onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'k', 'ctrlKey': true }))}
              className="flex items-center gap-2 px-2.5 py-1 rounded-lg border border-border bg-muted/45 text-foreground/80 hover:text-foreground hover:bg-primary/8 hover:border-primary/20 transition-all duration-200"
            >
              <Search className="w-3 h-3" />
              <span className="text-[10px] font-semibold uppercase hidden sm:block tracking-wide">Search</span>
              <kbd className="hidden lg:inline-flex h-4 items-center gap-1 rounded border border-border bg-background/70 px-1 font-mono text-[9px] font-medium opacity-100">
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
                className="rounded-lg border border-border bg-muted/40 text-foreground/80 hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </nav>
      </header>

      <main className="pt-20 lg:pt-24 pb-12">
        <div className="mx-4 lg:ml-6 px-4 max-w-[96%]">
          {children}
        </div>
      </main>
      <NeuralNexusWidget />
    </div>
  );
};
