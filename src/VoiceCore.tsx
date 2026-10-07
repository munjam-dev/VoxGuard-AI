import { Canvas, useFrame } from '@react-three/fiber'
import { Float, OrbitControls, Sparkles } from '@react-three/drei'
import { Suspense, useMemo, useRef } from 'react'
import type { Group, Mesh } from 'three'
import { useReducedMotion } from 'framer-motion'

function VoiceCore({ active }: { active: boolean }) {
  const group = useRef<Group>(null)
  const core = useRef<Mesh>(null)
  const reduced = useReducedMotion()
  const particles = useMemo(() => {
    const values = new Float32Array(420 * 3)
    for (let i = 0; i < values.length; i += 3) {
      const radius = 1.45 + (i % 7) * .035
      const phi = Math.acos(2 * ((i * 17 % 97) / 96) - 1)
      const theta = (i * 2.399963) % (Math.PI * 2)
      values[i] = radius * Math.sin(phi) * Math.cos(theta)
      values[i + 1] = radius * Math.cos(phi)
      values[i + 2] = radius * Math.sin(phi) * Math.sin(theta)
    }
    return values
  }, [])
  useFrame((state, delta) => {
    if (!group.current || reduced) return
    group.current.rotation.y += delta * (active ? .28 : .08)
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * .35) * .1
    if (core.current) core.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * (active ? 4 : 1.5)) * (active ? .05 : .018))
  })
  return <group ref={group}>
    <mesh ref={core}><sphereGeometry args={[1.12, 48, 48]} /><meshPhysicalMaterial color="#182b63" emissive="#173c93" emissiveIntensity={active ? 1.4 : .65} roughness={.18} metalness={.65} transparent opacity={.72} wireframe /></mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.34, .012, 8, 128]} /><meshBasicMaterial color="#68a4ff" transparent opacity={active ? .9 : .4} /></mesh>
    <mesh rotation={[0, Math.PI / 2, .3]}><torusGeometry args={[1.5, .008, 8, 128]} /><meshBasicMaterial color="#73d8db" transparent opacity={active ? .7 : .24} /></mesh>
    <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[particles, 3]} /></bufferGeometry><pointsMaterial color="#8bb7ff" size={.025} transparent opacity={active ? .95 : .55} sizeAttenuation /></points>
    <Sparkles count={active ? 90 : 45} scale={3.5} size={active ? 2.5 : 1.3} speed={active ? 1.6 : .35} color="#78baff" />
  </group>
}

export function VoiceCoreScene({ active }: { active: boolean }) {
  return <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 4.4], fov: 42 }} gl={{ antialias: true, powerPreference: 'high-performance' }} aria-label="Animated AI voice core visualization">
    <ambientLight intensity={.3} /><pointLight position={[2, 2, 3]} color="#789dff" intensity={4} /><pointLight position={[-3, -1, 1]} color="#58d4dc" intensity={2} />
    <Suspense fallback={null}><Float speed={active ? 2 : .65} rotationIntensity={.08} floatIntensity={.22}><VoiceCore active={active} /></Float></Suspense>
    <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
  </Canvas>
}
