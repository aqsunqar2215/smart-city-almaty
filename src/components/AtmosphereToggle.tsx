import { CloudRain, Snowflake, Sparkles, Wind, Sun, Zap, Flame, Move, Stars, Waves } from 'lucide-react';
import { Button } from './ui/button';
import { useAtmosphere, AtmosphereType } from '@/contexts/AtmosphereContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from './ui/dropdown-menu';
import { useSoundEffects } from '@/hooks/useSoundEffects';

export const AtmosphereToggle = () => {
    const { atmosphere, setAtmosphere } = useAtmosphere();
    const { playClick, playHover } = useSoundEffects();

    const icons: Record<AtmosphereType, React.ReactNode> = {
        none: <Sun className="h-4 w-4" />,
        rain: <CloudRain className="h-4 w-4" />,
        snow: <Snowflake className="h-4 w-4" />,
        aurora: <Sparkles className="h-4 w-4" />,
        wind: <Wind className="h-4 w-4" />,
        cyberstorm: <Zap className="h-4 w-4" />,
        solarflare: <Flame className="h-4 w-4" />,
        sandstorm: <Move className="h-4 w-4" />,
        stardust: <Stars className="h-4 w-4" />,
        ocean: <Waves className="h-4 w-4" />,
    };

    const labels: Record<AtmosphereType, string> = {
        none: 'Clear Sky',
        rain: 'Summer Rain',
        snow: 'Soft Snow',
        aurora: 'Aurora Borealis',
        wind: 'Gale Wind',
        cyberstorm: 'Neon Cyberstorm',
        solarflare: 'Solar Flare',
        sandstorm: 'Desert Sandstorm',
        stardust: 'Celestial Stardust',
        ocean: 'Ocean Waves',
    };

    const handleChange = (type: AtmosphereType) => {
        setAtmosphere(type);
        playClick();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-primary hover:bg-muted rounded-xl relative overflow-hidden"
                    onMouseEnter={playHover}
                >
                    {icons[atmosphere]}
                    <span className="sr-only">Toggle atmosphere</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover/80 backdrop-blur-xl border-border rounded-xl">
                {(Object.keys(icons) as Array<AtmosphereType>).map((type) => (
                    <DropdownMenuItem
                        key={type}
                        onClick={() => handleChange(type)}
                        className={`flex items-center gap-2 cursor-pointer transition-colors ${atmosphere === type ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                        {icons[type]}
                        <span className="text-xs font-bold uppercase tracking-tight">{labels[type]}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
