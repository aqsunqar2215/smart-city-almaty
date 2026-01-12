import React, { useRef, useEffect, useMemo } from 'react';

interface ShaderBackgroundProps {
    variant: 'digital-rain' | 'organic-flow' | 'data-constellation' | 'fingerprint' | 'alert-pulse' | 'metro-grid' | 'matrix' | 'aurora';
    opacity?: number;
    speed?: number;
    className?: string;
}

const ShaderBackground: React.FC<ShaderBackgroundProps> = ({
    variant,
    opacity = 0.15,  // Much lower default opacity
    speed = 1,
    className = '',
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);

    // Very soft, subtle color palette
    const colors = useMemo(() => {
        switch (variant) {
            case 'digital-rain':
                return { primary: 'rgba(0, 160, 200, 0.25)', secondary: 'rgba(0, 100, 160, 0.15)', bg: 'rgba(0, 10, 20, 0.01)' };
            case 'organic-flow':
                return { primary: 'rgba(40, 180, 120, 0.2)', secondary: 'rgba(60, 160, 80, 0.12)', bg: 'rgba(0, 20, 10, 0.01)' };
            case 'data-constellation':
                return { primary: 'rgba(120, 80, 200, 0.25)', secondary: 'rgba(80, 60, 160, 0.15)', bg: 'rgba(10, 5, 30, 0.01)' };
            case 'fingerprint':
                return { primary: 'rgba(200, 140, 40, 0.2)', secondary: 'rgba(180, 120, 30, 0.12)', bg: 'rgba(20, 15, 5, 0.01)' };
            case 'alert-pulse':
                return { primary: 'rgba(200, 60, 60, 0.2)', secondary: 'rgba(160, 40, 40, 0.12)', bg: 'rgba(20, 5, 5, 0.01)' };
            case 'metro-grid':
                return { primary: 'rgba(40, 120, 200, 0.2)', secondary: 'rgba(80, 140, 180, 0.1)', bg: 'rgba(5, 10, 30, 0.01)' };
            case 'matrix':
                return { primary: 'rgba(30, 180, 60, 0.2)', secondary: 'rgba(20, 140, 40, 0.12)', bg: 'rgba(3, 15, 5, 0.01)' };
            case 'aurora':
                return { primary: 'rgba(30, 180, 160, 0.18)', secondary: 'rgba(160, 60, 160, 0.12)', bg: 'rgba(5, 15, 20, 0.01)' };
            default:
                return { primary: 'rgba(0, 160, 200, 0.25)', secondary: 'rgba(0, 100, 160, 0.15)', bg: 'rgba(0, 10, 20, 0.01)' };
        }
    }, [variant]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        let time = 0;

        // Fewer particles for subtlety
        const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number }> = [];
        const particleCount = variant === 'data-constellation' ? 25 : 18;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2,
                size: Math.random() * 1.5 + 0.5,
                alpha: Math.random() * 0.3 + 0.1,
            });
        }

        const animate = () => {
            time += 0.006 * speed;

            // Very subtle fade
            ctx.fillStyle = colors.bg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            switch (variant) {
                case 'digital-rain':
                    drawMinimalRain(ctx, canvas, time, colors, particles);
                    break;
                case 'organic-flow':
                    drawSoftWaves(ctx, canvas, time, colors);
                    break;
                case 'data-constellation':
                    drawElegantConstellation(ctx, canvas, time, colors, particles);
                    break;
                case 'fingerprint':
                    drawSoftRipples(ctx, canvas, time, colors);
                    break;
                case 'alert-pulse':
                    drawSubtleAlert(ctx, canvas, time, colors);
                    break;
                case 'metro-grid':
                    drawCleanGrid(ctx, canvas, time, colors);
                    break;
                case 'matrix':
                    drawMinimalCode(ctx, canvas, time, colors);
                    break;
                case 'aurora':
                    drawSoftAurora(ctx, canvas, time, colors);
                    break;
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationRef.current);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [variant, speed, colors]);

    return (
        <canvas
            ref={canvasRef}
            className={`fixed inset-0 pointer-events-none ${className}`}
            style={{ opacity, zIndex: -1 }}
        />
    );
};

// All drawing functions with reduced intensity
function drawMinimalRain(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, colors: any, particles: any[]) {
    particles.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = colors.primary;
        ctx.fill();

        p.y += 0.4;
        p.x += Math.sin(time + i) * 0.05;

        if (p.y > canvas.height + 10) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
        }
    });
}

function drawSoftWaves(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, colors: any) {
    for (let wave = 0; wave < 3; wave++) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);

        for (let x = 0; x <= canvas.width; x += 10) {
            const y = canvas.height / 2 + Math.sin(x * 0.003 + time + wave * 0.5) * (30 + wave * 10);
            ctx.lineTo(x, y);
        }

        ctx.strokeStyle = wave % 2 === 0 ? colors.primary : colors.secondary;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

function drawElegantConstellation(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, colors: any, particles: any[]) {
    particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = colors.primary;
        ctx.fill();
    });

    particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
            const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
            if (dist < 150) {
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = colors.secondary;
                ctx.globalAlpha = (1 - dist / 150) * 0.2;
                ctx.lineWidth = 0.5;
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
        });
    });
}

function drawSoftRipples(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, colors: any) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    for (let i = 1; i < 10; i++) {
        const radius = i * 70 + Math.sin(time + i * 0.2) * 8;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = i % 2 === 0 ? colors.primary : colors.secondary;
        ctx.globalAlpha = 0.1 - i * 0.008;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
}

function drawSubtleAlert(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, colors: any) {
    const pulse = Math.sin(time * 1.2) * 0.5 + 0.5;
    const edgeWidth = 40 + pulse * 15;

    const leftGrad = ctx.createLinearGradient(0, 0, edgeWidth, 0);
    leftGrad.addColorStop(0, colors.primary);
    leftGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = leftGrad;
    ctx.globalAlpha = pulse * 0.12;
    ctx.fillRect(0, 0, edgeWidth, canvas.height);

    const rightGrad = ctx.createLinearGradient(canvas.width, 0, canvas.width - edgeWidth, 0);
    rightGrad.addColorStop(0, colors.primary);
    rightGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = rightGrad;
    ctx.fillRect(canvas.width - edgeWidth, 0, edgeWidth, canvas.height);
    ctx.globalAlpha = 1;
}

function drawCleanGrid(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, colors: any) {
    const gridSize = 100;

    ctx.strokeStyle = colors.secondary;
    ctx.globalAlpha = 0.05;
    ctx.lineWidth = 0.5;

    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Just 2 moving dots
    for (let t = 0; t < 2; t++) {
        const baseY = canvas.height * (0.3 + t * 0.4);
        const xPos = ((time * 30 + t * 400) % (canvas.width + 100)) - 50;

        ctx.beginPath();
        ctx.arc(xPos, baseY, 3, 0, Math.PI * 2);
        ctx.fillStyle = colors.primary;
        ctx.fill();
    }
}

function drawMinimalCode(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, colors: any) {
    const chars = '01';
    const fontSize = 10;
    const columns = Math.floor(canvas.width / (fontSize * 4));

    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < columns; i++) {
        const x = i * fontSize * 4 + fontSize;
        const y = ((time * 15 + i * 60) % (canvas.height + 50)) - 25;

        for (let c = 0; c < 3; c++) {
            const charY = y - c * fontSize * 1.5;
            if (charY < 0 || charY > canvas.height) continue;

            const char = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillStyle = colors.primary;
            ctx.globalAlpha = c === 0 ? 0.25 : 0.1;
            ctx.fillText(char, x, charY);
        }
    }
    ctx.globalAlpha = 1;
}

function drawSoftAurora(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, colors: any) {
    for (let band = 0; band < 2; band++) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height * 0.3);

        for (let x = 0; x <= canvas.width; x += 8) {
            const baseY = canvas.height * 0.25 + band * 80;
            const y = baseY + Math.sin(x * 0.002 + time + band * 0.8) * 50;
            ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.3, colors.primary);
        gradient.addColorStop(0.7, colors.secondary);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.05;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

export default ShaderBackground;
