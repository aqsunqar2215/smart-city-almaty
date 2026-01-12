import React, { useEffect, useRef, useState } from 'react';

/**
 * Cursor Glow Effect - follows mouse with a glowing trail
 */
export const CursorGlow: React.FC = () => {
    const glowRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (glowRef.current) {
                glowRef.current.style.left = `${e.clientX}px`;
                glowRef.current.style.top = `${e.clientY}px`;
                setIsVisible(true);
            }
        };

        const handleMouseLeave = () => {
            setIsVisible(false);
        };

        window.addEventListener('mousemove', handleMouseMove);
        document.body.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            document.body.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <div
            ref={glowRef}
            className="cursor-glow"
            style={{
                opacity: isVisible ? 0.6 : 0,
                position: 'fixed',
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(56, 189, 248, 0.05) 0%, rgba(139, 92, 246, 0.02) 40%, transparent 70%)',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                zIndex: 9999,
                transition: 'opacity 0.3s ease',
                mixBlendMode: 'plus-lighter',
            }}
        />
    );
};

/**
 * Scroll Progress Bar
 */
export const ScrollProgress: React.FC = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const currentProgress = (window.scrollY / totalHeight) * 100;
            setProgress(currentProgress);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-transparent">
            <div
                className="h-full bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-150"
                style={{ width: `${progress}%` }}
            />
            <div
                className="absolute right-0 top-0 h-full w-20 opacity-60"
                style={{
                    background: 'linear-gradient(90deg, transparent, white)',
                    width: `${Math.min(progress, 20)}%`,
                    right: `${100 - progress}%`,
                }}
            />
        </div>
    );
};

/**
 * Scroll Reveal Animation - reveals elements as they enter viewport
 */
export const ScrollReveal: React.FC<{
    children: React.ReactNode;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
    className?: string;
}> = ({ children, delay = 0, direction = 'up', className = '' }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    const getTransform = () => {
        if (isVisible) return 'translate(0, 0)';
        switch (direction) {
            case 'up': return 'translate(0, 40px)';
            case 'down': return 'translate(0, -40px)';
            case 'left': return 'translate(40px, 0)';
            case 'right': return 'translate(-40px, 0)';
            case 'fade': return 'translate(0, 0)';
            default: return 'translate(0, 40px)';
        }
    };

    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: getTransform(),
                transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s`,
            }}
        >
            {children}
        </div>
    );
};

/**
 * Parallax Container - moves elements at different speeds on scroll
 */
export const ParallaxContainer: React.FC<{
    children: React.ReactNode;
    speed?: number;
    className?: string;
}> = ({ children, speed = 0.5, className = '' }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (ref.current) {
                const scrolled = window.scrollY;
                ref.current.style.transform = `translateY(${scrolled * speed}px)`;
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [speed]);

    return (
        <div ref={ref} className={className}>
            {children}
        </div>
    );
};

/**
 * Magnetic Element - element that follows cursor slightly
 */
export const MagneticElement: React.FC<{
    children: React.ReactNode;
    strength?: number;
    className?: string;
}> = ({ children, strength = 0.3, className = '' }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const deltaX = (e.clientX - centerX) * strength;
            const deltaY = (e.clientY - centerY) * strength;

            element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        };

        const handleMouseLeave = () => {
            element.style.transform = 'translate(0, 0)';
        };

        element.addEventListener('mousemove', handleMouseMove);
        element.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            element.removeEventListener('mousemove', handleMouseMove);
            element.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [strength]);

    return (
        <div ref={ref} className={className} style={{ transition: 'transform 0.2s ease-out' }}>
            {children}
        </div>
    );
};

/**
 * Spotlight Effect - highlights area around cursor on hover
 */
export const SpotlightCard: React.FC<{
    children: React.ReactNode;
    className?: string;
}> = ({ children, className = '' }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            setPosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            });
        }
    };

    return (
        <div
            ref={cardRef}
            className={`relative overflow-hidden ${className}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* Spotlight gradient */}
            <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                style={{
                    opacity: isHovering ? 1 : 0,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(56, 189, 248, 0.1), transparent 40%)`,
                }}
            />
            {/* Border spotlight */}
            <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-inherit"
                style={{
                    opacity: isHovering ? 1 : 0,
                    background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(56, 189, 248, 0.15), transparent 40%)`,
                    mask: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
                    maskComposite: 'exclude',
                    padding: '1px',
                }}
            />
            {children}
        </div>
    );
};

export default {
    CursorGlow,
    ScrollProgress,
    ScrollReveal,
    ParallaxContainer,
    MagneticElement,
    SpotlightCard,
};
