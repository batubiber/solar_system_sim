import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Trail, Html } from '@react-three/drei';
import { 
  Vector3, 
  Mesh, 
  Texture, 
  TextureLoader, 
  CanvasTexture, 
  DoubleSide, 
  AdditiveBlending, 
  Color 
} from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { BodyData, BodyType } from '../types';
import { G, MAX_TRAIL_LENGTH } from '../constants';
import { generatePlanetTexture } from '../utils/textureGenerator';

// --- Physics Types & Logic ---
type PhysicsBody = {
  id: string;
  mass: number;
  pos: Vector3;
  vel: Vector3;
  meshRef: React.MutableRefObject<Mesh | null>;
};

interface SceneProps {
  bodies: BodyData[];
  timeScale: number;
  paused: boolean;
  onBodyClick: (id: string) => void;
  selectedBodyId: string | null;
}

interface BodyMeshProps { 
  data: BodyData; 
  physicsRef: React.MutableRefObject<Map<string, PhysicsBody>>;
  isSelected: boolean;
  onClick: (id: string) => void;
}

// Separate component for camera tracking logic
const CameraController = ({ 
  selectedBodyId, 
  physicsRef, 
  controlsRef
}: { 
  selectedBodyId: string | null, 
  physicsRef: React.MutableRefObject<Map<string, PhysicsBody>>,
  controlsRef: React.RefObject<OrbitControlsImpl>
}) => {
  useFrame(() => {
    if (selectedBodyId && physicsRef.current.has(selectedBodyId)) {
      const body = physicsRef.current.get(selectedBodyId);
      const controls = controlsRef.current;
      
      // Strict null checks to prevent "Cannot read properties of undefined (reading 'copy')"
      if (body && body.pos && controls && controls.target && typeof controls.target.copy === 'function') {
        controls.target.copy(body.pos);
        controls.update();
      }
    }
  });

  return null;
};

const BodyMesh: React.FC<BodyMeshProps> = ({ 
  data, 
  physicsRef, 
  isSelected,
  onClick 
}) => {
  const meshRef = useRef<Mesh>(null);
  const [textureUrl, setTextureUrl] = useState<string>('');
  const [texture, setTexture] = useState<Texture | null>(null);

  // Generate texture on mount
  useEffect(() => {
    const url = generatePlanetTexture(data.type, data.color);
    setTextureUrl(url);
  }, [data.type, data.color]);

  // Load texture when URL is ready
  useEffect(() => {
    if (textureUrl) {
      const loader = new TextureLoader();
      const tex = loader.load(textureUrl);
      setTexture(tex);
    }
  }, [textureUrl]);
  
  // Register physics
  useEffect(() => {
    if (!physicsRef.current) return;
    physicsRef.current.set(data.id, {
      id: data.id,
      mass: data.mass,
      pos: new Vector3(data.position.x, data.position.y, data.position.z),
      vel: new Vector3(data.velocity.x, data.velocity.y, data.velocity.z),
      meshRef: meshRef
    });
    return () => { physicsRef.current.delete(data.id); };
  }, [data.id, data.mass, data.position, data.velocity, physicsRef]);

  // Material selection based on type
  const isStar = data.type === BodyType.Star;
  const hasRings = data.id === 'saturn';

  // Generate a glow texture for stars
  const glowTexture = useMemo(() => {
    if (!isStar) return null;
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    // Soft radial gradient for bloom/glow effect
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.5)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    
    return new CanvasTexture(canvas);
  }, [isStar]);

  const renderMesh = () => (
    <mesh 
      ref={meshRef} 
      position={[data.position.x, data.position.y, data.position.z]}
      onClick={(e) => {
        e.stopPropagation();
        onClick(data.id);
      }}
    >
      <sphereGeometry args={[data.radius, 64, 64]} />
      
      {isStar ? (
        <meshBasicMaterial color={data.color} map={texture} />
      ) : (
        <meshStandardMaterial 
          color={texture ? '#ffffff' : data.color}
          map={texture}
          roughness={0.8}
          metalness={0.1}
        />
      )}

      {/* Saturn Rings */}
      {hasRings && (
        <mesh rotation={[-Math.PI / 2.1, 0, 0]}>
          <ringGeometry args={[data.radius * 1.4, data.radius * 2.5, 64]} />
          <meshStandardMaterial 
            color="#C7B498" 
            side={DoubleSide} 
            transparent 
            opacity={0.7} 
            roughness={0.8}
          />
        </mesh>
      )}

      {/* Selection Ring */}
      {isSelected && (
        <mesh>
          <sphereGeometry args={[data.radius * 1.5, 32, 32]} />
          <meshBasicMaterial color="#ffffff" wireframe opacity={0.2} transparent />
        </mesh>
      )}

      {/* Star Glow effect if star */}
      {isStar && (
         <group>
           <pointLight distance={300} intensity={2} decay={1} color="#ffffff" />
           {glowTexture && (
             <sprite scale={[data.radius * 8, data.radius * 8, 1]}>
               <spriteMaterial 
                 map={glowTexture} 
                 color={data.color} 
                 transparent 
                 opacity={0.8} 
                 blending={AdditiveBlending} 
                 depthWrite={false} 
               />
             </sprite>
           )}
         </group>
      )}

      {/* Label - Moved inside mesh to track position */}
      <Html position={[0, data.radius * 1.5 + 2, 0]} center distanceFactor={150} zIndexRange={[100, 0]}>
        <div className={`pointer-events-none select-none text-white text-xs font-sans font-bold drop-shadow-md whitespace-nowrap transition-opacity duration-300 ${isSelected ? 'opacity-100 text-yellow-300' : 'opacity-70'}`}>
           {data.name}
        </div>
      </Html>
    </mesh>
  );

  return (
    <group>
      {!isStar ? (
        <Trail
          width={isSelected ? 3 : 1}
          length={MAX_TRAIL_LENGTH}
          color={new Color(data.color)}
          attenuation={(t) => t * t}
        >
          {renderMesh()}
        </Trail>
      ) : (
        renderMesh()
      )}
    </group>
  );
};

const SimulationLoop = ({ 
  physicsRef, 
  timeScale, 
  paused 
}: { 
  physicsRef: React.MutableRefObject<Map<string, PhysicsBody>>; 
  timeScale: number; 
  paused: boolean; 
}) => {
  useFrame((state, delta) => {
    if (paused) return;

    const dt = Math.min(delta, 0.1) * timeScale;
    const bodies: PhysicsBody[] = Array.from(physicsRef.current.values());
    const forces = new Map<string, Vector3>();

    for (const body of bodies) {
      forces.set(body.id, new Vector3(0, 0, 0));
    }

    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const bodyA = bodies[i];
        const bodyB = bodies[j];

        const diff = new Vector3().subVectors(bodyB.pos, bodyA.pos);
        const distSq = diff.lengthSq();
        
        // Softening parameter to avoid singularities
        if (distSq < 0.1) continue; 

        const fMagnitude = (G * bodyA.mass * bodyB.mass) / distSq;
        const fDir = diff.normalize();
        const fVec = fDir.multiplyScalar(fMagnitude);

        forces.get(bodyA.id)?.add(fVec);
        forces.get(bodyB.id)?.sub(fVec);
      }
    }

    for (const body of bodies) {
      const force = forces.get(body.id)!;
      const acceleration = force.clone().divideScalar(body.mass);
      body.vel.add(acceleration.multiplyScalar(dt));
      body.pos.add(body.vel.clone().multiplyScalar(dt));

      // Guard against meshRef not being ready or position being missing
      if (body.meshRef.current && body.meshRef.current.position) {
        body.meshRef.current.position.copy(body.pos);
      }
    }
  });

  return null;
};

const Scene: React.FC<SceneProps> = ({ bodies, timeScale, paused, onBodyClick, selectedBodyId }) => {
  const physicsRef = useRef<Map<string, PhysicsBody>>(new Map());
  const controlsRef = useRef<OrbitControlsImpl>(null);

  useEffect(() => {
    if (controlsRef.current) {
        controlsRef.current.maxDistance = 500;
        controlsRef.current.minDistance = 2;
    }
  }, []);

  return (
    <Canvas camera={{ position: [0, 50, 80], fov: 45 }} dpr={[1, 2]} shadows>
      <color attach="background" args={['#050510']} />
      
      {/* Background Stars */}
      <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={0.5} />
      
      {/* Ambient light for basic visibility of dark sides */}
      <ambientLight intensity={0.05} />

      {/* Camera Controls */}
      <OrbitControls 
        ref={controlsRef}
        makeDefault 
      />
      
      {/* Camera Tracking Logic */}
      <CameraController 
        selectedBodyId={selectedBodyId} 
        physicsRef={physicsRef} 
        controlsRef={controlsRef}
      />

      {/* Physics Engine */}
      <SimulationLoop physicsRef={physicsRef} timeScale={timeScale} paused={paused} />

      {/* Bodies */}
      {bodies.map(body => (
        <BodyMesh 
          key={body.id} 
          data={body} 
          physicsRef={physicsRef} 
          isSelected={selectedBodyId === body.id}
          onClick={onBodyClick}
        />
      ))}
    </Canvas>
  );
};

export default Scene;