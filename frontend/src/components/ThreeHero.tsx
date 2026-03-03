import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, Float, MeshDistortMaterial, Environment } from '@react-three/drei'
import * as THREE from 'three'

function AiCore() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3
    }
  })

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      {/* Central Core - The "Brain" */}
      <mesh ref={meshRef} position={[0, 0, 0]} scale={[1.4, 1.4, 1.4]}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial 
          color="#4264fb" 
          distort={0.4} 
          speed={2} 
          metalness={0.9} 
          roughness={0.1} 
        />
      </mesh>
      
      {/* Wireframe shell */}
      <mesh position={[0,0,0]} scale={[1.45, 1.45, 1.45]}>
         <icosahedronGeometry args={[1, 2]} />
         <meshStandardMaterial color="#8ca6ff" wireframe transparent opacity={0.3} />
      </mesh>
    </Float>
  )
}

function Satellite({ position, delay }: { position: [number, number, number], delay: number }) {
  const ref = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (ref.current) {
      // Orbit logic
      const t = state.clock.getElapsedTime() + delay
      const r = 3 // radius
      ref.current.position.x = Math.cos(t * 0.5) * r
      ref.current.position.z = Math.sin(t * 0.5) * r
      ref.current.position.y = Math.sin(t * 1.5) * 0.5 // bob up and down
      
      ref.current.rotation.y += 0.02
    }
  })

  return (
    <mesh ref={ref} position={position}>
      <octahedronGeometry args={[0.3, 0]} />
      <meshStandardMaterial color="#00ff9d" metalness={0.8} roughness={0.2} emissive="#003310" />
    </mesh>
  )
}

function DataRings() {
   const groupRef = useRef<THREE.Group>(null)

   useFrame(() => {
     if(groupRef.current) {
        groupRef.current.rotation.z += 0.002
        groupRef.current.rotation.y += 0.005
     }
   })

   return (
     <group ref={groupRef}>
       <mesh rotation={[Math.PI / 2, 0, 0]}>
         <torusGeometry args={[4, 0.02, 16, 100]} />
         <meshBasicMaterial color="#304060" transparent opacity={0.4} />
       </mesh>
       <mesh rotation={[Math.PI / 1.5, Math.PI / 6, 0]}>
         <torusGeometry args={[5, 0.02, 16, 100]} />
         <meshBasicMaterial color="#304060" transparent opacity={0.2} />
       </mesh>
     </group>
   )
}

function ChainLinksParams() {
    // Generate random positions for data particles
    const particles = useMemo(() => {
        return new Float32Array(Array.from({length: 100}, () => (Math.random() - 0.5) * 15))
    }, [])
    
    return (
        <points>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[particles, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.05} color="#5588ff" sizeAttenuation transparent opacity={0.6} />
        </points>
    )
}

export function ThreeHero() {
  return (
    <div className="hero-canvas" style={{ height: '500px', width: '100%', position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#4466ff" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#ff0066" />
        
        <AiCore />
        <Satellite position={[3, 0, 0]} delay={0} />
        <Satellite position={[-3, 1, 1]} delay={2} />
        <Satellite position={[0, -2, 3]} delay={4} />
        <DataRings />
        <ChainLinksParams />

        <Environment preset="city" />
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} enablePan={false} />
      </Canvas>
    </div>
  )
}
