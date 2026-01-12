import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    glow?: 'primary' | 'success' | 'warning' | 'danger' | 'none';
    blur?: 'sm' | 'md' | 'lg' | 'xl';
    onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className = '',
    hover = true,
    glow = 'none',
    blur = 'xl',
    onClick,
}) => {
    const blurMap = {
        sm: 'backdrop-blur-sm',
        md: 'backdrop-blur-md',
        lg: 'backdrop-blur-lg',
        xl: 'backdrop-blur-xl',
    };

    const glowMap = {
        none: '',
        primary: 'shadow-[0_0_30px_rgba(0,212,255,0.15)]',
        success: 'shadow-[0_0_30px_rgba(16,185,129,0.15)]',
        warning: 'shadow-[0_0_30px_rgba(245,158,11,0.15)]',
        danger: 'shadow-[0_0_30px_rgba(239,68,68,0.15)]',
    };

    return (
        <motion.div
            className={cn(
                'relative overflow-hidden rounded-2xl',
                'bg-white dark:bg-white/5 border border-border/60 dark:border-white/10 shadow-md dark:shadow-none',
                blurMap[blur],
                glowMap[glow],
                hover && 'transition-all duration-300 hover:shadow-lg dark:hover:bg-white/10 hover:border-border dark:hover:border-white/20',
                hover && 'hover:-translate-y-1',
                onClick && 'cursor-pointer',
                className
            )}
            onClick={onClick}
            whileHover={hover ? { scale: 1.01 } : undefined}
            whileTap={onClick ? { scale: 0.99 } : undefined}
        >
            {/* Inner glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
};

export default GlassCard;
