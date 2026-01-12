import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';

const CityBlocks = () => {
    const groupRef = useRef<THREE.Group>(null);

    const blocks = useMemo(() => {
        const items = [];
        for (let x = -5; x <= 5; x += 1.5) {
            for (let z = -5; z <= 5; z += 1.5) {
                if (Math.random() > 0.3) {
                    const height = 0.5 + Math.random() * 3;
                    items.push({ x, z, height, color: Math.random() > 0.8 ? '#00d4ff' : '#1e293b' });
                }
            }
        }
        return items;
    }, []);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.002;
        }
    });

    return (
        <group ref={groupRef}>
            {blocks.map((b, i) => (
                <Box key={i} args={[1, b.height, 1]} position={[b.x, b.height / 2, b.z]}>
                    <meshStandardMaterial
                        color={b.color}
                        emissive={b.color}
                        emissiveIntensity={b.color === '#00d4ff' ? 2 : 0}
                        transparent
                        opacity={0.8}
                    />
                </Box>
            ))}
            <Grid
                infiniteGrid
                fadeDistance={20}
                fadeStrength={5}
                cellSize={1}
                sectionSize={3}
                sectionColor="#00d4ff"
                cellColor="#1e293b"
            />
        </group>
    );
};

// Moving MEMO into the component scope properly
function CityModel() {
    const blocks = React.useMemo(() => {
        const items = [];
        for (let x = -5; x <= 5; x += 1.5) {
            for (let z = -5; z <= 5; z += 1.5) {
                if (Math.random() > 0.3) {
                    const height = 0.5 + Math.random() * 3;
                    items.push({ x, z, height, color: Math.random() > 0.8 ? '#00d4ff' : '#1e293b' });
                }
            }
        }
        return items;
    }, []);

    return (
        <>
            {blocks.map((b, i) => (
                <Box key={i} args={[1, b.height, 1]} position={[b.x, b.height / 2, b.z]}>
                    <meshStandardMaterial
                        color={b.color}
                        emissive={b.color}
                        emissiveIntensity={b.color === '#00d4ff' ? 1.5 : 0.1}
                        transparent
                        opacity={0.6}
                    />
                </Box>
            ))}
            <Grid
                infiniteGrid
                fadeDistance={15}
                fadeStrength={3}
                cellSize={1}
                sectionSize={3}
                sectionColor="#00d4ff"
                cellColor="#1e293b"
            />
        </>
    );
}

export const MiniMapHologram = () => {
    const groupRef = useRef<THREE.Group>(null);

    return (
        <div className="w-full h-48 bg-slate-950/50 rounded-xl overflow-hidden border border-white/5">
            <Canvas camera={{ position: [10, 10, 10], fov: 35 }}>
                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#00d4ff" />
                <group rotation={[0, 0, 0]}>
                    <CityModel />
                </group>
                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
        </div>
    );
};
