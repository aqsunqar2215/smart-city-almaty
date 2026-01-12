import { useCallback, useRef, useEffect } from 'react';
import { Howl } from 'howler';

// Sound configuration - soft, pleasant, minimalist
const SOUNDS = {
    click: '/sounds/click-soft.mp3',
    hover: '/sounds/hover-light.mp3',
    success: '/sounds/success-chime.mp3',
    error: '/sounds/error-buzz.mp3',
    notification: '/sounds/notification.mp3',
    transition: '/sounds/transition.mp3',
};

// Fallback to Web Audio API generated sounds if files don't exist
const createSynthSound = (type: 'click' | 'hover' | 'success' | 'error' | 'notification' | 'transition') => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    return () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Different sound profiles for each type
        switch (type) {
            case 'click':
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                break;
            case 'hover':
                oscillator.frequency.value = 600;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
                break;
            case 'success':
                oscillator.frequency.value = 523.25; // C5
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                break;
            case 'error':
                oscillator.frequency.value = 200;
                oscillator.type = 'sawtooth';
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                break;
            case 'notification':
                oscillator.frequency.value = 880;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
                break;
            case 'transition':
                oscillator.frequency.value = 400;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                break;
        }

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    };
};

interface UseSoundEffectsOptions {
    enabled?: boolean;
    volume?: number;
}

export function useSoundEffects(options: UseSoundEffectsOptions = {}) {
    const { enabled = true, volume = 0.3 } = options;
    const soundsRef = useRef<Map<string, Howl | (() => void)>>(new Map());
    const synthSoundsRef = useRef<Map<string, () => void>>(new Map());

    // Initialize synth sounds as fallback
    useEffect(() => {
        if (typeof window !== 'undefined') {
            (Object.keys(SOUNDS) as Array<keyof typeof SOUNDS>).forEach((key) => {
                synthSoundsRef.current.set(key, createSynthSound(key));
            });
        }
    }, []);

    const playSound = useCallback((type: keyof typeof SOUNDS) => {
        if (!enabled) return;

        // Check for prefers-reduced-motion
        if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        // Try to use synth sound (always available)
        const synthSound = synthSoundsRef.current.get(type);
        if (synthSound) {
            try {
                synthSound();
            } catch (e) {
                // Audio context might be suspended
                console.debug('Sound playback skipped:', e);
            }
        }
    }, [enabled]);

    const playClick = useCallback(() => { }, []);
    const playHover = useCallback(() => { }, []);
    const playSuccess = useCallback(() => playSound('success'), [playSound]);
    const playError = useCallback(() => playSound('error'), [playSound]);
    const playNotification = useCallback(() => playSound('notification'), [playSound]);
    const playTransition = useCallback(() => playSound('transition'), [playSound]);

    return {
        playClick,
        playHover,
        playSuccess,
        playError,
        playNotification,
        playTransition,
        playSound,
    };
}

export default useSoundEffects;
