import React from 'react';
import { motion } from 'framer-motion';

const Stream = ({ delay = 0, top = '50%' }) => (
    <motion.div
        className="absolute left-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent w-full"
        style={{ top }}
        initial={{ x: '-100%', opacity: 0 }}
        animate={{
            x: '100%',
            opacity: [0, 1, 1, 0]
        }}
        transition={{
            duration: 8,
            repeat: Infinity,
            delay,
            ease: "linear"
        }}
    />
);

export const DataStreamFlow = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-20">
            {[...Array(15)].map((_, i) => (
                <Stream
                    key={i}
                    delay={i * 1.2}
                    top={`${10 + Math.random() * 80}%`}
                />
            ))}
        </div>
    );
};
