import React, { useState, useEffect, useRef } from 'react';

/**
 * Animated Counter Component - numbers count up on mount
 */
export const AnimatedCounter: React.FC<{
    value: number;
    duration?: number;
    suffix?: string;
    prefix?: string;
    className?: string;
}> = ({ value, duration = 1500, suffix = '', prefix = '', className = '' }) => {
    const [count, setCount] = useState(0);
    const countRef = useRef(0);
    const startTimeRef = useRef<number | null>(null);

    useEffect(() => {
        const animate = (timestamp: number) => {
            if (!startTimeRef.current) startTimeRef.current = timestamp;
            const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            countRef.current = Math.floor(easeOutQuart * value);
            setCount(countRef.current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);

        return () => {
            startTimeRef.current = null;
        };
    }, [value, duration]);

    return (
        <span className={`count-up ${className}`}>
            {prefix}{count.toLocaleString()}{suffix}
        </span>
    );
};

/**
 * Ripple Effect Component - adds water ripple on click
 */
export const RippleButton: React.FC<{
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}> = ({ children, className = '', onClick }) => {
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();

        setRipples(prev => [...prev, { x, y, id }]);

        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== id));
        }, 600);

        onClick?.();
    };

    return (
        <button className={`ripple ${className}`} onClick={handleClick}>
            {children}
            {ripples.map(ripple => (
                <span
                    key={ripple.id}
                    className="ripple-effect"
                    style={{
                        left: ripple.x,
                        top: ripple.y,
                        width: 20,
                        height: 20,
                    }}
                />
            ))}
        </button>
    );
};

/**
 * Tilt Card Component - 3D tilt effect on hover
 */
export const TiltCard: React.FC<{
    children: React.ReactNode;
    className?: string;
    maxTilt?: number;
}> = ({ children, className = '', maxTilt = 10 }) => {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -maxTilt;
        const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * maxTilt;

        cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    };

    const handleMouseLeave = () => {
        if (cardRef.current) {
            cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        }
    };

    return (
        <div
            ref={cardRef}
            className={`tilt-card ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ transition: 'transform 0.15s ease' }}
        >
            {children}
        </div>
    );
};

/**
 * Magnetic Button - button that follows cursor slightly
 */
export const MagneticButton: React.FC<{
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    strength?: number;
}> = ({ children, className = '', onClick, strength = 0.3 }) => {
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!buttonRef.current) return;

        const rect = buttonRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        buttonRef.current.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    };

    const handleMouseLeave = () => {
        if (buttonRef.current) {
            buttonRef.current.style.transform = 'translate(0, 0)';
        }
    };

    return (
        <button
            ref={buttonRef}
            className={`magnetic-btn ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            style={{ transition: 'transform 0.2s ease' }}
        >
            {children}
        </button>
    );
};

/**
 * Shimmer Loading Skeleton
 */
export const ShimmerSkeleton: React.FC<{
    width?: string | number;
    height?: string | number;
    className?: string;
    rounded?: boolean;
}> = ({ width = '100%', height = 20, className = '', rounded = false }) => {
    return (
        <div
            className={`shimmer ${rounded ? 'rounded-full' : 'rounded-lg'} ${className}`}
            style={{ width, height }}
        />
    );
};

/**
 * Stagger List - animates children with delay
 */
export const StaggerList: React.FC<{
    children: React.ReactNode;
    className?: string;
}> = ({ children, className = '' }) => {
    return (
        <div className={className}>
            {React.Children.map(children, (child, index) => (
                <div
                    className="stagger-item"
                    style={{ animationDelay: `${index * 0.08}s` }}
                >
                    {child}
                </div>
            ))}
        </div>
    );
};

/**
 * Confetti Effect - shows confetti on success
 */
export const Confetti: React.FC<{ active: boolean }> = ({ active }) => {
    if (!active) return null;

    const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 2,
        color: ['#f43f5e', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'][Math.floor(Math.random() * 5)],
    }));

    return (
        <div className="confetti-container">
            {confettiPieces.map(piece => (
                <div
                    key={piece.id}
                    style={{
                        position: 'absolute',
                        left: `${piece.left}%`,
                        top: '-10px',
                        width: '10px',
                        height: '10px',
                        background: piece.color,
                        borderRadius: Math.random() > 0.5 ? '50%' : '0',
                        animation: `confetti-fall ${piece.duration}s ease-in-out ${piece.delay}s forwards`,
                    }}
                />
            ))}
            <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
        </div>
    );
};

/**
 * Progress Bar with Glow
 */
export const GlowProgress: React.FC<{
    value: number;
    max?: number;
    className?: string;
    showLabel?: boolean;
}> = ({ value, max = 100, className = '', showLabel = false }) => {
    const percentage = Math.min((value / max) * 100, 100);

    return (
        <div className={`progress-glow h-3 ${className}`}>
            <div className="bar" style={{ width: `${percentage}%` }} />
            {showLabel && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium">
                    {Math.round(percentage)}%
                </span>
            )}
        </div>
    );
};

/**
 * Floating Action Button
 */
export const FloatingActionButton: React.FC<{
    icon: React.ReactNode;
    onClick?: () => void;
    className?: string;
}> = ({ icon, onClick, className = '' }) => {
    return (
        <button className={`fab ${className}`} onClick={onClick}>
            {icon}
        </button>
    );
};

/**
 * Tooltip with animation
 */
export const AnimatedTooltip: React.FC<{
    children: React.ReactNode;
    content: string;
    className?: string;
}> = ({ children, content, className = '' }) => {
    return (
        <div className={`tooltip-animated ${className}`} data-tooltip={content}>
            {children}
        </div>
    );
};

/**
 * Live Data Indicator
 */
export const LiveIndicator: React.FC<{
    children: React.ReactNode;
    className?: string;
}> = ({ children, className = '' }) => {
    return (
        <div className={`data-live relative ${className}`}>
            {children}
        </div>
    );
};

/**
 * Gradient Text
 */
export const GradientText: React.FC<{
    children: React.ReactNode;
    className?: string;
}> = ({ children, className = '' }) => {
    return (
        <span className={`gradient-text ${className}`}>
            {children}
        </span>
    );
};

/**
 * Glowing Border Card
 */
export const GlowCard: React.FC<{
    children: React.ReactNode;
    className?: string;
}> = ({ children, className = '' }) => {
    return (
        <div className={`glow-border relative rounded-xl p-[2px] ${className}`}>
            <div className="rounded-xl bg-card p-4">
                {children}
            </div>
        </div>
    );
};

export default {
    AnimatedCounter,
    RippleButton,
    TiltCard,
    MagneticButton,
    ShimmerSkeleton,
    StaggerList,
    Confetti,
    GlowProgress,
    FloatingActionButton,
    AnimatedTooltip,
    LiveIndicator,
    GradientText,
    GlowCard,
};
