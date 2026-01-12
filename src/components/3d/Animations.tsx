import React from 'react';

/**
 * 3D Floating Cube Animation - for Dashboard/Tech pages
 */
export const FloatingCube: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`floating-cube-container ${className}`}>
      <div className="cube">
        <div className="face front" />
        <div className="face back" />
        <div className="face right" />
        <div className="face left" />
        <div className="face top" />
        <div className="face bottom" />
      </div>
      <style>{`
        .floating-cube-container {
          perspective: 1000px;
          width: 100px;
          height: 100px;
        }
        .cube {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          animation: cube-rotate 20s linear infinite;
        }
        .face {
          position: absolute;
          width: 100px;
          height: 100px;
          border: 1px solid rgba(56, 189, 248, 0.3);
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%);
          backdrop-filter: blur(4px);
        }
        .front { transform: translateZ(50px); }
        .back { transform: rotateY(180deg) translateZ(50px); }
        .right { transform: rotateY(90deg) translateZ(50px); }
        .left { transform: rotateY(-90deg) translateZ(50px); }
        .top { transform: rotateX(90deg) translateZ(50px); }
        .bottom { transform: rotateX(-90deg) translateZ(50px); }
        @keyframes cube-rotate {
          from { transform: rotateX(0) rotateY(0); }
          to { transform: rotateX(360deg) rotateY(360deg); }
        }
      `}</style>
    </div>
  );
};

/**
 * 3D Rotating Ring - for Analytics pages
 */
export const RotatingRing: React.FC<{ className?: string; color?: string }> = ({
  className = '',
  color = 'rgba(139, 92, 246, 0.5)'
}) => {
  return (
    <div className={`rotating-ring-container ${className}`}>
      <div className="ring ring-1" />
      <div className="ring ring-2" />
      <div className="ring ring-3" />
      <style>{`
        .rotating-ring-container {
          position: relative;
          width: 150px;
          height: 150px;
          perspective: 1000px;
        }
        .ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid ${color};
          animation: ring-rotate 8s linear infinite;
        }
        .ring-1 {
          animation-delay: 0s;
          border-color: rgba(56, 189, 248, 0.4);
        }
        .ring-2 {
          animation-delay: -2.67s;
          transform: rotateX(60deg);
          border-color: rgba(139, 92, 246, 0.4);
        }
        .ring-3 {
          animation-delay: -5.33s;
          transform: rotateX(-60deg);
          border-color: rgba(20, 184, 166, 0.4);
        }
        @keyframes ring-rotate {
          from { transform: rotateY(0) rotateX(30deg); }
          to { transform: rotateY(360deg) rotateX(30deg); }
        }
      `}</style>
    </div>
  );
};

/**
 * 3D Floating Orbs - for Eco/Nature pages
 */
export const FloatingOrbs: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`floating-orbs ${className}`}>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="orb"
          style={{
            '--delay': `${i * 0.5}s`,
            '--size': `${30 + i * 15}px`,
            '--x': `${20 + i * 15}%`,
            '--color': ['#38bdf8', '#8b5cf6', '#14b8a6', '#f59e0b', '#ec4899'][i],
          } as React.CSSProperties}
        />
      ))}
      <style>{`
        .floating-orbs {
          position: relative;
          width: 200px;
          height: 200px;
        }
        .orb {
          position: absolute;
          width: var(--size);
          height: var(--size);
          left: var(--x);
          top: 50%;
          transform: translateY(-50%);
          background: radial-gradient(circle at 30% 30%, var(--color), transparent);
          border-radius: 50%;
          filter: blur(1px);
          animation: orb-float 4s ease-in-out infinite;
          animation-delay: var(--delay);
          opacity: 0.6;
        }
        @keyframes orb-float {
          0%, 100% { transform: translateY(-50%) translateX(0) scale(1); }
          50% { transform: translateY(-70%) translateX(10px) scale(1.1); }
        }
      `}</style>
    </div>
  );
};

/**
 * 3D DNA Helix - for Profile/Bio pages
 */
export const DNAHelix: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`dna-helix ${className}`}>
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="dna-strand"
          style={{ '--i': i } as React.CSSProperties}
        >
          <div className="node node-1" />
          <div className="connector" />
          <div className="node node-2" />
        </div>
      ))}
      <style>{`
        .dna-helix {
          position: relative;
          width: 60px;
          height: 200px;
          perspective: 500px;
        }
        .dna-strand {
          position: absolute;
          width: 100%;
          height: 16px;
          top: calc(var(--i) * 16px);
          animation: dna-rotate 3s linear infinite;
          animation-delay: calc(var(--i) * -0.25s);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .node {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: linear-gradient(135deg, #38bdf8, #8b5cf6);
          box-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
        }
        .node-2 {
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
        }
        .connector {
          flex: 1;
          height: 2px;
          background: linear-gradient(90deg, rgba(56, 189, 248, 0.3), rgba(139, 92, 246, 0.3));
          margin: 0 5px;
        }
        @keyframes dna-rotate {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
      `}</style>
    </div>
  );
};

/**
 * 3D Radar Scan - for Emergency/Security pages
 */
export const RadarScan: React.FC<{ className?: string; color?: string }> = ({
  className = '',
  color = '#ef4444'
}) => {
  return (
    <div className={`radar-container ${className}`}>
      <div className="radar">
        <div className="radar-line" />
        <div className="radar-dot dot-1" />
        <div className="radar-dot dot-2" />
        <div className="radar-dot dot-3" />
      </div>
      <style>{`
        .radar-container {
          width: 150px;
          height: 150px;
          position: relative;
        }
        .radar {
          width: 100%;
          height: 100%;
          border: 2px solid ${color}40;
          border-radius: 50%;
          position: relative;
          background: radial-gradient(circle, transparent 30%, ${color}10 100%);
        }
        .radar::before, .radar::after {
          content: '';
          position: absolute;
          border: 1px solid ${color}20;
          border-radius: 50%;
        }
        .radar::before {
          inset: 25%;
        }
        .radar::after {
          inset: 50%;
        }
        .radar-line {
          position: absolute;
          width: 50%;
          height: 2px;
          background: linear-gradient(90deg, ${color}00, ${color});
          top: 50%;
          left: 50%;
          transform-origin: left center;
          animation: radar-sweep 3s linear infinite;
        }
        .radar-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          background: ${color};
          border-radius: 50%;
          animation: radar-blink 3s ease-in-out infinite;
          box-shadow: 0 0 10px ${color};
        }
        .dot-1 { top: 30%; left: 60%; animation-delay: 0.5s; }
        .dot-2 { top: 60%; left: 30%; animation-delay: 1s; }
        .dot-3 { top: 45%; left: 70%; animation-delay: 1.5s; }
        @keyframes radar-sweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes radar-blink {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

/**
 * 3D Metro/Transport Animation - for Transport pages
 */
export const MetroTrack: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`metro-track ${className}`}>
      <div className="track" />
      <div className="train" />
      <div className="stations">
        <div className="station" style={{ left: '10%' }} />
        <div className="station" style={{ left: '40%' }} />
        <div className="station" style={{ left: '70%' }} />
      </div>
      <style>{`
        .metro-track {
          position: relative;
          width: 200px;
          height: 60px;
        }
        .track {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6);
          border-radius: 2px;
        }
        .train {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 30px;
          height: 16px;
          background: linear-gradient(90deg, #3b82f6, #60a5fa);
          border-radius: 8px;
          animation: train-move 4s ease-in-out infinite;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
        }
        .train::after {
          content: '';
          position: absolute;
          right: -20px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 4px;
          background: linear-gradient(90deg, rgba(59, 130, 246, 0.5), transparent);
        }
        .station {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 12px;
          height: 12px;
          background: #1e293b;
          border: 2px solid #3b82f6;
          border-radius: 50%;
        }
        @keyframes train-move {
          0% { left: 0%; }
          50% { left: calc(100% - 30px); }
          100% { left: 0%; }
        }
      `}</style>
    </div>
  );
};

/**
 * 3D Particle Wave - for general decorative use
 */
export const ParticleWave: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`particle-wave ${className}`}>
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{ '--i': i } as React.CSSProperties}
        />
      ))}
      <style>{`
        .particle-wave {
          position: relative;
          width: 200px;
          height: 100px;
        }
        .particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: linear-gradient(135deg, #38bdf8, #8b5cf6);
          border-radius: 50%;
          left: calc(var(--i) * 10px);
          animation: particle-float 2s ease-in-out infinite;
          animation-delay: calc(var(--i) * 0.1s);
          opacity: 0.6;
        }
        @keyframes particle-float {
          0%, 100% { 
            transform: translateY(50px);
            opacity: 0.3;
          }
          50% { 
            transform: translateY(0);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * 3D Glowing Globe - for Admin/Global pages
 */
export const GlowingGlobe: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`glowing-globe ${className}`}>
      <div className="globe">
        <div className="ring horizontal" />
        <div className="ring vertical" />
        <div className="ring diagonal" />
      </div>
      <style>{`
        .glowing-globe {
          width: 120px;
          height: 120px;
          perspective: 500px;
        }
        .globe {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          animation: globe-rotate 15s linear infinite;
        }
        .ring {
          position: absolute;
          inset: 0;
          border: 2px solid rgba(34, 197, 94, 0.3);
          border-radius: 50%;
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.2);
        }
        .ring.horizontal {
          transform: rotateX(80deg);
        }
        .ring.vertical {
          transform: rotateY(0deg);
        }
        .ring.diagonal {
          transform: rotateY(45deg) rotateX(45deg);
          border-color: rgba(56, 189, 248, 0.3);
          box-shadow: 0 0 20px rgba(56, 189, 248, 0.2);
        }
        @keyframes globe-rotate {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
      `}</style>
    </div>
  );
};

/**
 * 3D Cyber Sphere - with glowing core
 */
export const CyberSphere: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`cyber-sphere-container ${className}`}>
      <div className="outer-ring" />
      <div className="core" />
      <div className="particles">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="mini-particle" style={{ '--i': i } as React.CSSProperties} />
        ))}
      </div>
      <style>{`
        .cyber-sphere-container {
            position: relative;
            width: 100px;
            height: 100px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .outer-ring {
            position: absolute;
            width: 100%;
            height: 100%;
            border: 2px solid rgba(56, 189, 248, 0.2);
            border-radius: 50%;
            animation: ring-pulse 4s ease-in-out infinite;
        }
        .core {
            width: 40px;
            height: 40px;
            background: radial-gradient(circle, #38bdf8 0%, #8b5cf6 100%);
            border-radius: 50%;
            box-shadow: 0 0 30px rgba(56, 189, 248, 0.6);
            animation: core-glow 2s ease-in-out infinite;
        }
        .mini-particle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: #38bdf8;
            border-radius: 50%;
            left: 50%;
            top: 50%;
            transform: rotate(calc(var(--i) * 45deg)) translate(40px);
            animation: orbital-move 10s linear infinite;
        }
        @keyframes ring-pulse {
            0%, 100% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.2); opacity: 0.6; }
        }
        @keyframes core-glow {
            0%, 100% { transform: scale(1); filter: brightness(1); }
            50% { transform: scale(1.1); filter: brightness(1.3); }
        }
        @keyframes orbital-move {
            from { transform: rotate(0deg) translate(45px) rotate(0deg); }
            to { transform: rotate(360deg) translate(45px) rotate(-360deg); }
        }
      `}</style>
    </div>
  );
};

/**
 * 3D Tech Pyramid
 */
export const TechPyramid: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`tech-pyramid-container ${className}`}>
      <div className="pyramid">
        <div className="side s1" />
        <div className="side s2" />
        <div className="side s3" />
        <div className="side s4" />
        <div className="base" />
      </div>
      <style>{`
        .tech-pyramid-container {
            perspective: 1000px;
            width: 100px;
            height: 100px;
        }
        .pyramid {
            position: relative;
            width: 100%;
            height: 100%;
            transform-style: preserve-3d;
            animation: pyramid-rotate 10s linear infinite;
        }
        .side {
            position: absolute;
            width: 0;
            height: 0;
            border-left: 50px solid transparent;
            border-right: 50px solid transparent;
            border-bottom: 86.6px solid rgba(56, 189, 248, 0.15);
            backdrop-filter: blur(2px);
            border-bottom: 86.6px solid rgba(56, 189, 248, 0.2);
        }
        .side::after {
            content: '';
            position: absolute;
            top: 0; left: -50px;
            width: 100px; height: 100px;
            border-bottom: 1px solid rgba(56, 189, 248, 0.4);
        }
        .s1 { transform: rotateY(0deg) rotateX(30deg) translateZ(0); transform-origin: top center; }
        .s2 { transform: rotateY(90deg) rotateX(30deg) translateZ(0); transform-origin: top center; }
        .s3 { transform: rotateY(180deg) rotateX(30deg) translateZ(0); transform-origin: top center; }
        .s4 { transform: rotateY(270deg) rotateX(30deg) translateZ(0); transform-origin: top center; }
        @keyframes pyramid-rotate {
            from { transform: rotateY(0deg); }
            to { transform: rotateY(360deg); }
        }
      `}</style>
    </div>
  );
};

/**
 * 3D Black Hole - with accretion disk and distortion
 */
export const BlackHole: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`black-hole-container ${className}`}>
      <div className="event-horizon" />
      <div className="accretion-disk" />
      <div className="distortion-field" />
      <style>{`
        .black-hole-container {
          position: relative;
          width: 200px;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          perspective: 1000px;
        }
        .event-horizon {
          position: absolute;
          width: 60px;
          height: 60px;
          background: #000;
          border-radius: 50%;
          box-shadow: 0 0 40px 10px rgba(0, 0, 0, 0.8), 0 0 20px 5px #8b5cf6;
          z-index: 2;
        }
        .accretion-disk {
          position: absolute;
          width: 180px;
          height: 40px;
          background: conic-gradient(from 0deg, transparent, #38bdf8, #8b5cf6, #ec4899, transparent);
          border-radius: 50%;
          transform: rotateX(75deg) rotateZ(0deg);
          animation: bh-rotate 4s linear infinite;
          filter: blur(4px);
          opacity: 0.6;
        }
        .distortion-field {
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, transparent 40%, rgba(139, 92, 246, 0.1) 60%, transparent 80%);
          animation: bh-pulse 3s ease-in-out infinite;
        }
        @keyframes bh-rotate {
          from { transform: rotateX(75deg) rotateZ(0deg); }
          to { transform: rotateX(75deg) rotateZ(360deg); }
        }
        @keyframes bh-pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

/**
 * 3D Flying Comet - with particle trail
 */
export const Comet: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`comet-container ${className}`}>
      <div className="comet-head" />
      <div className="comet-tail" />
      <style>{`
        .comet-container {
          position: relative;
          width: 100px;
          height: 2px;
          transform: rotate(-45deg);
        }
        .comet-head {
          position: absolute;
          right: 0;
          width: 4px;
          height: 4px;
          background: #fff;
          border-radius: 50%;
          box-shadow: 0 0 10px 2px #38bdf8, 0 0 20px 5px #fff;
        }
        .comet-tail {
          position: absolute;
          right: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.8));
          filter: blur(1px);
        }
      `}</style>
    </div>
  );
};

/**
 * 3D Star Field - dynamic pulsating stars
 */
export const StarField: React.FC<{ className?: string; count?: number }> = ({ className = '', count = 50 }) => {
  return (
    <div className={`star-field ${className}`}>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="star"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            '--size': `${Math.random() * 3}px`,
            '--duration': `${2 + Math.random() * 4}s`,
            '--delay': `${Math.random() * 5}s`,
          } as React.CSSProperties}
        />
      ))}
      <style>{`
        .star-field {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .star {
          position: absolute;
          width: var(--size);
          height: var(--size);
          background: #fff;
          border-radius: 50%;
          opacity: 0;
          animation: star-pulse var(--duration) ease-in-out infinite;
          animation-delay: var(--delay);
        }
        @keyframes star-pulse {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 0.8; transform: scale(1); box-shadow: 0 0 5px #fff; }
        }
      `}</style>
    </div>
  );
};

export default {
  FloatingCube,
  RotatingRing,
  FloatingOrbs,
  DNAHelix,
  RadarScan,
  MetroTrack,
  ParticleWave,
  GlowingGlobe,
  CyberSphere,
  TechPyramid,
  BlackHole,
  Comet,
  StarField,
};
