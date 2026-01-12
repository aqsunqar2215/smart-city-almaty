import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion';
import { useSoundEffects } from '@/hooks/useSoundEffects';

/**
 * DirectionalScrollEffect - triggers different visuals/sounds based on scroll direction
 */
export const DirectionalScrollEffect: React.FC<{
    children: React.ReactNode;
    upElement?: React.ReactNode;
    downElement?: React.ReactNode;
}> = ({ children, upElement, downElement }) => {
    const { scrollY } = useScroll();
    const [direction, setDirection] = useState<'up' | 'down' | null>(null);
    const [lastY, setLastY] = useState(0);
    const { playTransition } = useSoundEffects();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useMotionValueEvent(scrollY, "change", (latest) => {
        const diff = latest - lastY;
        if (Math.abs(diff) > 10) {
            const newDir = diff > 0 ? 'down' : 'up';
            if (newDir !== direction) {
                setDirection(newDir);
            }
            setLastY(latest);

            // Reset direction after stop scrolling
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                setDirection(null);
            }, 1000);
        }
    });

    return (
        <div className="relative w-full h-full">
            {/* Background layer for scroll-up specific effects */}
            <motion.div
                className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
                animate={{
                    opacity: direction === 'up' ? 1 : 0,
                    scale: direction === 'up' ? 1.1 : 1,
                    rotate: direction === 'up' ? -2 : 0
                }}
                transition={{ duration: 0.5 }}
            >
                {upElement}
            </motion.div>

            {/* Background layer for scroll-down specific effects */}
            <motion.div
                className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
                animate={{
                    opacity: direction === 'down' ? 1 : 0,
                    scale: direction === 'down' ? 1.2 : 1,
                    rotate: direction === 'down' ? 2 : 0
                }}
                transition={{ duration: 0.5 }}
            >
                {downElement}
            </motion.div>

            {/* Main content layer */}
            <motion.div
                className="relative z-10"
                style={{
                    transformStyle: "preserve-3d"
                }}
            >
                {children}
            </motion.div>
        </div>
    );
};

/**
 * ScrollParallaxLayer - elements that move at different rates
 */
export const ScrollParallaxLayer: React.FC<{
    children: React.ReactNode;
    offset?: number;
    className?: string;
}> = ({ children, offset = 100, className = '' }) => {
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 1000], [0, offset]);
    const springY = useSpring(y, { stiffness: 100, damping: 30 });

    return (
        <motion.div style={{ y: springY }} className={className}>
            {children}
        </motion.div>
    );
};
