import React, { useEffect, useRef } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { useAtmosphere, AtmosphereType } from '@/contexts/AtmosphereContext';

/**
 * Rain Visual Effect - Improved with size variation
 */
const RainEffect = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
            {[...Array(150)].map((_, i) => {
                const height = 15 + Math.random() * 20;
                return (
                    <div
                        key={i}
                        className="absolute w-[1px] bg-blue-400/40"
                        style={{
                            height: `${height}px`,
                            left: `${Math.random() * 100}%`,
                            top: `-40px`,
                            animation: `rain-fall ${0.4 + Math.random() * 0.4}s linear infinite`,
                            animationDelay: `${Math.random() * 2}s`,
                            opacity: 0.1 + Math.random() * 0.4
                        }}
                    />
                );
            })}
            <style>{`
                @keyframes rain-fall {
                    to { transform: translateY(110vh) translateX(10px); }
                }
            `}</style>
        </div>
    );
};

/**
 * Snow Visual Effect - Improved with horizontal flutter
 */
const SnowEffect = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
            {[...Array(120)].map((_, i) => {
                const size = 2 + Math.random() * 3;
                return (
                    <div
                        key={i}
                        className="absolute rounded-full bg-white"
                        style={{
                            width: `${size}px`,
                            height: `${size}px`,
                            left: `${Math.random() * 100}%`,
                            top: `-20px`,
                            animation: `snow-drift ${4 + Math.random() * 6}s linear infinite`,
                            animationDelay: `${Math.random() * 5}s`,
                            opacity: 0.3 + Math.random() * 0.7,
                            filter: 'blur(1px)'
                        }}
                    />
                );
            })}
            <style>{`
                @keyframes snow-drift {
                    0% { transform: translateY(0) translateX(0); }
                    25% { transform: translateY(25vh) translateX(20px); }
                    50% { transform: translateY(50vh) translateX(-20px); }
                    75% { transform: translateY(75vh) translateX(20px); }
                    100% { transform: translateY(110vh) translateX(0); }
                }
            `}</style>
        </div>
    );
};

/**
 * Aurora Visual Effect
 */
const AuroraEffect = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden opacity-30">
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-emerald-500/20 to-transparent animate-aurora-sweep" />
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-purple-500/10 to-transparent animate-aurora-sweep-delayed" />
            <style>{`
                @keyframes aurora-sweep {
                    0%, 100% { transform: translateY(-50%) skewY(-10deg) scaleY(2); opacity: 0.3; }
                    50% { transform: translateY(50%) skewY(10deg) scaleY(1.5); opacity: 0.6; }
                }
                .animate-aurora-sweep { animation: aurora-sweep 10s ease-in-out infinite; }
                .animate-aurora-sweep-delayed { animation: aurora-sweep 15s ease-in-out infinite reverse; animation-delay: -5s; }
            `}</style>
        </div>
    );
};

/**
 * Wind Visual Effect
 */
const WindEffect = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
            {[...Array(20)].map((_, i) => (
                <div
                    key={i}
                    className="absolute h-[1px] bg-white/10"
                    style={{
                        width: `${100 + Math.random() * 200}px`,
                        left: `-300px`,
                        top: `${Math.random() * 100}%`,
                        animation: `wind-sweep ${2 + Math.random() * 3}s linear infinite`,
                        animationDelay: `${Math.random() * 5}s`,
                        opacity: 0.1 + Math.random() * 0.2
                    }}
                />
            ))}
            <style>{`
                @keyframes wind-sweep {
                    to { transform: translateX(calc(100vw + 300px)) skewX(-20deg); }
                }
            `}</style>
        </div>
    );
};

/**
 * Ocean Visual Effect - Wave Splashes
 */
const OceanEffect = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
            {[...Array(5)].map((_, i) => (
                <div
                    key={i}
                    className="absolute bottom-0 w-[40vw] h-[40vh] bg-gradient-to-t from-blue-400/20 to-transparent"
                    style={{
                        left: `${i * 20}%`,
                        borderRadius: '100% 100% 0 0',
                        filter: 'blur(30px)',
                        animation: `wave-impact-splash ${8 + i}s ease-out infinite`,
                        animationDelay: `${i * 1.5}s`
                    }}
                />
            ))}
            <div className="absolute bottom-0 w-full h-32 bg-blue-500/5 backdrop-blur-md" />
        </div>
    );
};

/**
 * Cyberstorm Visual Effect
 */
const CyberstormEffect = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden bg-fuchsia-500/5">
            <div className="absolute inset-0 animate-glitch-overlay opacity-20" />
            <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400/50 animate-scan-line" />
            {[...Array(10)].map((_, i) => (
                <div
                    key={i}
                    className="absolute bg-white/40 blur-sm"
                    style={{
                        width: `${Math.random() * 500}px`,
                        height: '1px',
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animation: `glitch-flash ${0.1 + Math.random() * 0.2}s step-end infinite`,
                        animationDelay: `${Math.random() * 5}s`
                    }}
                />
            ))}
            <style>{`
                @keyframes glitch-overlay {
                    0%, 100% { background: transparent; }
                    95% { background: rgba(255, 0, 255, 0.05); }
                    97% { background: rgba(0, 255, 255, 0.05); }
                }
                @keyframes scan-line {
                    from { transform: translateY(0); }
                    to { transform: translateY(100vh); }
                }
                @keyframes glitch-flash {
                    0%, 100% { opacity: 0; }
                    50% { opacity: 1; }
                }
                .animate-glitch-overlay { animation: glitch-overlay 4s steps(1) infinite; }
                .animate-scan-line { animation: scan-line 8s linear infinite; }
            `}</style>
        </div>
    );
};

/**
 * Solar Flare Visual Effect
 */
const SolarFlareEffect = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden bg-orange-500/10">
            <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-orange-400/20 to-transparent animate-pulse" />
            {[...Array(30)].map((_, i) => (
                <div
                    key={i}
                    className="absolute bg-orange-300 rounded-full blur-xl"
                    style={{
                        width: `${50 + Math.random() * 200}px`,
                        height: `${50 + Math.random() * 200}px`,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        opacity: 0.1 + Math.random() * 0.1,
                        animation: `float-heat ${10 + Math.random() * 20}s ease-in-out infinite`,
                        animationDelay: `-${Math.random() * 10}s`
                    }}
                />
            ))}
            <style>{`
                @keyframes float-heat {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(${Math.random() * 50}px, ${Math.random() * 50}px) scale(1.2); }
                }
            `}</style>
        </div>
    );
};

/**
 * Sandstorm Visual Effect
 */
const SandstormEffect = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden bg-amber-900/10">
            <div className="absolute inset-0 backdrop-sepia-[0.3]" />
            {[...Array(150)].map((_, i) => (
                <div
                    key={i}
                    className="absolute w-[2px] h-[2px] bg-amber-200/40 rounded-full"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animation: `dust-drift ${1 + Math.random()}s linear infinite`,
                        animationDelay: `${Math.random() * 2}s`,
                        opacity: 0.2 + Math.random() * 0.4
                    }}
                />
            ))}
            <style>{`
                @keyframes dust-drift {
                    from { transform: translateX(0) translateY(0); }
                    to { transform: translateX(200px) translateY(20px); }
                }
            `}</style>
        </div>
    );
};

/**
 * Stardust Visual Effect
 */
const StardustEffect = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
            {[...Array(60)].map((_, i) => (
                <div
                    key={i}
                    className="absolute bg-white rounded-full"
                    style={{
                        width: `${1 + Math.random() * 2}px`,
                        height: `${1 + Math.random() * 2}px`,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        boxShadow: `0 0 10px 2px rgba(139, 92, 246, 0.4)`,
                        animation: `sparkle-float ${4 + Math.random() * 6}s ease-in-out infinite`,
                        animationDelay: `${Math.random() * 5}s`,
                        opacity: 0
                    }}
                />
            ))}
            <style>{`
                @keyframes sparkle-float {
                    0%, 100% { transform: translateY(0); opacity: 0; }
                    50% { transform: translateY(-30px); opacity: 0.8; }
                }
            `}</style>
        </div>
    );
};

/**
 * AtmosphereAudioManager - handles continuous ambient sounds
 */
const AtmosphereAudioManager = () => {
    const { atmosphere } = useAtmosphere();
    const audioContextRef = useRef<AudioContext | null>(null);
    const noiseNodeRef = useRef<AudioNode | null>(null);
    const filterNodeRef = useRef<BiquadFilterNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const atmosphereRef = useRef<AtmosphereType>(atmosphere);
    const modulationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        atmosphereRef.current = atmosphere;
        if (modulationTimeoutRef.current) clearTimeout(modulationTimeoutRef.current);

        if (atmosphere === 'none') {
            if (gainNodeRef.current) {
                gainNodeRef.current.gain.linearRampToValueAtTime(0, (audioContextRef.current?.currentTime || 0) + 1);
            }
            return;
        }

        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') {
            const resume = () => ctx.resume();
            window.addEventListener('click', resume, { once: true });
        }

        // Create Noise Generator if not exists
        if (!noiseNodeRef.current) {
            const bufferSize = 2 * ctx.sampleRate;
            const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }

            const noise = ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            noise.loop = true;

            const filter = ctx.createBiquadFilter();
            const gain = ctx.createGain();

            gain.gain.value = 0;
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            noise.start();

            noiseNodeRef.current = noise;
            filterNodeRef.current = filter;
            gainNodeRef.current = gain;
        }

        const filter = filterNodeRef.current!;
        const gain = gainNodeRef.current!;

        // Adjust sound based on atmosphere
        switch (atmosphere) {
            case 'rain':
                filter.type = 'lowpass';
                filter.frequency.setTargetAtTime(1200, ctx.currentTime, 0.5);
                gain.gain.setTargetAtTime(0.08, ctx.currentTime, 1);
                break;
            case 'snow':
                filter.type = 'lowpass';
                filter.frequency.setTargetAtTime(400, ctx.currentTime, 0.5);
                gain.gain.setTargetAtTime(0.08, ctx.currentTime, 1);
                break;
            case 'wind':
                filter.type = 'bandpass';
                filter.frequency.setTargetAtTime(800, ctx.currentTime, 0.5);
                filter.Q.setTargetAtTime(2, ctx.currentTime, 0.5);
                gain.gain.setTargetAtTime(0.05, ctx.currentTime, 1);
                // Dynamic wind modulation
                const modulation = () => {
                    if (atmosphereRef.current !== 'wind') return;
                    filter.frequency.setTargetAtTime(400 + Math.random() * 1200, ctx.currentTime, 1.5);
                    modulationTimeoutRef.current = setTimeout(modulation, 2000 + Math.random() * 3000);
                };
                modulation();
                break;
            case 'aurora':
                filter.type = 'lowpass';
                filter.frequency.setTargetAtTime(300, ctx.currentTime, 0.5);
                gain.gain.setTargetAtTime(0.04, ctx.currentTime, 1);
                break;
            case 'cyberstorm':
                filter.type = 'highpass';
                filter.frequency.setTargetAtTime(2000, ctx.currentTime, 0.5);
                gain.gain.setTargetAtTime(0.03, ctx.currentTime, 1);
                // Glitch bursts
                const glitch = () => {
                    if (atmosphereRef.current !== 'cyberstorm') return;
                    gain.gain.setValueAtTime(0.1, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
                    modulationTimeoutRef.current = setTimeout(glitch, 100 + Math.random() * 2000);
                };
                glitch();
                break;
            case 'solarflare':
                filter.type = 'lowpass';
                filter.frequency.setTargetAtTime(100, ctx.currentTime, 0.5);
                gain.gain.setTargetAtTime(0.1, ctx.currentTime, 1);
                break;
            case 'sandstorm':
                filter.type = 'bandpass';
                filter.frequency.setTargetAtTime(1500, ctx.currentTime, 0.5);
                gain.gain.setTargetAtTime(0.06, ctx.currentTime, 1);
                break;
            case 'stardust':
                filter.type = 'highpass';
                filter.frequency.setTargetAtTime(5000, ctx.currentTime, 0.5);
                gain.gain.setTargetAtTime(0.02, ctx.currentTime, 1);
                break;
            case 'ocean':
                filter.type = 'lowpass';
                filter.frequency.setTargetAtTime(300, ctx.currentTime, 0.5);
                gain.gain.setTargetAtTime(0.15, ctx.currentTime, 1);

                // Rolling Storm Waves modulation
                const stormWaves = () => {
                    if (atmosphereRef.current !== 'ocean') return;
                    const now = ctx.currentTime;

                    // Wave builds up (roar)
                    filter.frequency.linearRampToValueAtTime(800, now + 3);
                    gain.gain.linearRampToValueAtTime(0.3, now + 3);

                    // Impact / Crash
                    setTimeout(() => {
                        if (atmosphereRef.current !== 'ocean') return;
                        filter.frequency.linearRampToValueAtTime(200, ctx.currentTime + 4);
                        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 4);
                    }, 4000);

                    modulationTimeoutRef.current = setTimeout(stormWaves, 10000);
                };
                stormWaves();
                break;
            default:
                filter.type = 'lowpass';
                filter.frequency.setTargetAtTime(150, ctx.currentTime, 0.5);
                gain.gain.setTargetAtTime(0.02, ctx.currentTime, 1);
                break;
        }

        return () => {
            // gain.gain.setTargetAtTime(0, ctx.currentTime, 1);
        };
    }, [atmosphere]);

    return null;
};

export const AtmosphereEffects = () => {
    const { atmosphere } = useAtmosphere();

    return (
        <>
            <AtmosphereAudioManager />
            <AnimatePresence>
                {atmosphere === 'rain' && (
                    <motion.div key="rain" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <RainEffect />
                    </motion.div>
                )}
                {atmosphere === 'snow' && (
                    <motion.div key="snow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <SnowEffect />
                    </motion.div>
                )}
                {atmosphere === 'aurora' && (
                    <motion.div key="aurora" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <AuroraEffect />
                    </motion.div>
                )}
                {atmosphere === 'wind' && (
                    <motion.div key="wind" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <WindEffect />
                    </motion.div>
                )}
                {atmosphere === 'cyberstorm' && (
                    <motion.div key="cyberstorm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <CyberstormEffect />
                    </motion.div>
                )}
                {atmosphere === 'solarflare' && (
                    <motion.div key="solarflare" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <SolarFlareEffect />
                    </motion.div>
                )}
                {atmosphere === 'sandstorm' && (
                    <motion.div key="sandstorm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <SandstormEffect />
                    </motion.div>
                )}
                {atmosphere === 'stardust' && (
                    <motion.div key="stardust" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <StardustEffect />
                    </motion.div>
                )}
                {atmosphere === 'ocean' && (
                    <motion.div key="ocean" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <OceanEffect />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
