import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, GradientTexture, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const HologramSphere = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    const particlesRef = useRef<THREE.Points>(null);

    const particles = useMemo(() => {
        const count = 500;
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const r = 1.2;
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);
            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);
        }
        return positions;
    }, []);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (meshRef.current) {
            meshRef.current.rotation.y = time * 0.2;
            meshRef.current.rotation.z = time * 0.3;
        }
        if (particlesRef.current) {
            particlesRef.current.rotation.y = -time * 0.1;
        }
    });

    return (
        <group>
            <Float speed={4} rotationIntensity={1} floatIntensity={2}>
                <Sphere args={[0.8, 64, 64]} ref={meshRef}>
                    <MeshDistortMaterial
                        color="#00d4ff"
                        speed={3}
                        distort={0.4}
                        radius={1}
                        transparent
                        opacity={0.6}
                        roughness={0}
                        metalness={1}
                    >
                        <GradientTexture
                            stops={[0, 0.5, 1]}
                            colors={['#00d4ff', '#8b5cf6', '#ec4899']}
                        />
                    </MeshDistortMaterial>
                </Sphere>
            </Float>

            <Points ref={particlesRef} positions={particles}>
                <PointMaterial
                    transparent
                    color="#00d4ff"
                    size={0.02}
                    sizeAttenuation={true}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </Points>

            <pointLight position={[2, 2, 2]} intensity={1} color="#00d4ff" />
            <pointLight position={[-2, -2, -2]} intensity={0.5} color="#ec4899" />
        </group>
    );
};

export const AICore = () => {
    return (
        <div className="w-64 h-64 cursor-pointer">
            <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <HologramSphere />
            </Canvas>
        </div>
    );
};
