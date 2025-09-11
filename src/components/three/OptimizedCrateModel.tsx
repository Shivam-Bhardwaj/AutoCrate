'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CrateConfiguration } from '@/types/crate';
import { Html } from '@react-three/drei';

interface OptimizedCrateModelProps {
  config: CrateConfiguration;
  explodeFactor: number;
  showFaceLabels: boolean;
  showMeasurements: boolean;
  showWCS: boolean;
  componentVisibility: {
    skids: boolean;
    floor: boolean;
    panels: boolean;
    cleats: boolean;
    cog: boolean;
  };
  onHover: (component: string, dimensions: [number, number, number], position: [number, number, number]) => void;
  onHoverEnd: () => void;
}

// LOD configuration
const LOD_DISTANCES = {
  HIGH: 50,
  MEDIUM: 150,
  LOW: 300
};

// Materials with optimized settings
const MATERIALS = {
  skid: new THREE.MeshPhongMaterial({ 
    color: 0x8B4513, 
    shininess: 10,
    side: THREE.DoubleSide
  }),
  floor: new THREE.MeshPhongMaterial({ 
    color: 0xD2691E, 
    shininess: 15,
    side: THREE.DoubleSide
  }),
  panel: new THREE.MeshPhongMaterial({ 
    color: 0xF4A460, 
    shininess: 20,
    side: THREE.DoubleSide
  }),
  cleat: new THREE.MeshPhongMaterial({ 
    color: 0xA0522D, 
    shininess: 5,
    side: THREE.DoubleSide
  }),
  frame: new THREE.MeshPhongMaterial({ 
    color: 0x654321, 
    shininess: 5,
    side: THREE.DoubleSide
  })
};

// Optimized Box Component using instancing
const InstancedBoxes: React.FC<{
  instances: Array<{ position: [number, number, number]; dimensions: [number, number, number] }>;
  material: THREE.Material;
  explodeFactor: number;
  componentType: string;
  onHover: (component: string, dimensions: [number, number, number], position: [number, number, number]) => void;
  onHoverEnd: () => void;
}> = ({ instances, material, explodeFactor, componentType, onHover, onHoverEnd }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);

  useEffect(() => {
    if (!meshRef.current) return;

    instances.forEach((instance, i) => {
      const [x, y, z] = instance.position;
      const [width, height, depth] = instance.dimensions;
      
      // Apply explode effect
      const explodeX = x * (1 + explodeFactor * 0.01);
      const explodeY = y * (1 + explodeFactor * 0.01);
      const explodeZ = z * (1 + explodeFactor * 0.01);
      
      tempObject.position.set(explodeX, explodeY, explodeZ);
      tempObject.scale.set(width, height, depth);
      tempObject.updateMatrix();
      
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [instances, explodeFactor, tempObject]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, instances.length]}
      material={material}
      onPointerOver={(e) => {
        e.stopPropagation();
        const instanceId = e.instanceId;
        if (instanceId !== undefined && instanceId < instances.length) {
          const instance = instances[instanceId];
          onHover(componentType, instance.dimensions, instance.position);
        }
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHoverEnd();
      }}
    >
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  );
};

// Optimized Panel with LOD
const OptimizedPanel: React.FC<{
  position: [number, number, number];
  dimensions: [number, number, number];
  material: THREE.Material;
  explodeFactor: number;
  label?: string;
  showLabel: boolean;
  lod: 'high' | 'medium' | 'low';
}> = ({ position, dimensions, material, explodeFactor, label, showLabel, lod }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Apply explode effect
  const explodedPosition: [number, number, number] = [
    position[0] * (1 + explodeFactor * 0.01),
    position[1] * (1 + explodeFactor * 0.01),
    position[2] * (1 + explodeFactor * 0.01)
  ];

  // Reduce geometry complexity based on LOD
  const segmentsX = lod === 'high' ? 2 : 1;
  const segmentsY = lod === 'high' ? 2 : 1;

  return (
    <group position={explodedPosition}>
      <mesh ref={meshRef} material={material}>
        <boxGeometry args={[...dimensions, segmentsX, segmentsY]} />
      </mesh>
      {showLabel && lod === 'high' && label && (
        <Html center distanceFactor={10}>
          <div className="bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
            {label}
          </div>
        </Html>
      )}
    </group>
  );
};

// Main Optimized Crate Model Component
export const OptimizedCrateModel: React.FC<OptimizedCrateModelProps> = ({
  config,
  explodeFactor,
  showFaceLabels,
  showMeasurements,
  showWCS,
  componentVisibility,
  onHover,
  onHoverEnd
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [currentLOD, setCurrentLOD] = useState<'high' | 'medium' | 'low'>('high');
  
  // Calculate LOD based on camera distance
  useFrame(({ camera }) => {
    if (!groupRef.current) return;
    
    const distance = camera.position.distanceTo(groupRef.current.position);
    
    if (distance < LOD_DISTANCES.HIGH) {
      setCurrentLOD('high');
    } else if (distance < LOD_DISTANCES.MEDIUM) {
      setCurrentLOD('medium');
    } else {
      setCurrentLOD('low');
    }
  });

  // Calculate crate components
  const components = useMemo(() => {
    const { dimensions, base, cap } = config;
    const scale = 0.01; // Convert inches to Three.js units
    
    const skids: Array<{ position: [number, number, number]; dimensions: [number, number, number] }> = [];
    const panels: Array<{ position: [number, number, number]; dimensions: [number, number, number]; label: string }> = [];
    const cleats: Array<{ position: [number, number, number]; dimensions: [number, number, number] }> = [];
    
    // Calculate skids (simplified for instancing)
    if (componentVisibility.skids) {
      const skidCount = base.skidCount || 2;
      const skidSpacing = dimensions.width / (skidCount + 1);
      
      for (let i = 0; i < skidCount; i++) {
        const xPos = -dimensions.width / 2 + (i + 1) * skidSpacing;
        skids.push({
          position: [xPos * scale, 0, base.skidHeight * scale / 2],
          dimensions: [base.skidWidth * scale, dimensions.length * scale, base.skidHeight * scale]
        });
      }
    }
    
    // Calculate panels
    if (componentVisibility.panels) {
      const baseHeight = (base.skidHeight + base.floorboardThickness) * scale;
      
      // Front panel
      panels.push({
        position: [0, -dimensions.width * scale / 2, baseHeight + dimensions.height * scale / 2],
        dimensions: [dimensions.length * scale, cap.frontPanel.thickness * scale, dimensions.height * scale],
        label: 'Front'
      });
      
      // Back panel
      panels.push({
        position: [0, dimensions.width * scale / 2, baseHeight + dimensions.height * scale / 2],
        dimensions: [dimensions.length * scale, cap.backPanel.thickness * scale, dimensions.height * scale],
        label: 'Back'
      });
      
      // Left panel
      panels.push({
        position: [-dimensions.length * scale / 2, 0, baseHeight + dimensions.height * scale / 2],
        dimensions: [cap.leftPanel.thickness * scale, dimensions.width * scale, dimensions.height * scale],
        label: 'Left'
      });
      
      // Right panel
      panels.push({
        position: [dimensions.length * scale / 2, 0, baseHeight + dimensions.height * scale / 2],
        dimensions: [cap.rightPanel.thickness * scale, dimensions.width * scale, dimensions.height * scale],
        label: 'Right'
      });
      
      // Top panel
      if (cap.topPanel) {
        panels.push({
          position: [0, 0, baseHeight + dimensions.height * scale],
          dimensions: [dimensions.length * scale, dimensions.width * scale, cap.topPanel.thickness * scale],
          label: 'Top'
        });
      }
    }
    
    // Calculate cleats (simplified for performance)
    if (componentVisibility.cleats && currentLOD === 'high') {
      const cleatSize = 2 * scale;
      const corners = [
        [-dimensions.length * scale / 2, -dimensions.width * scale / 2],
        [dimensions.length * scale / 2, -dimensions.width * scale / 2],
        [-dimensions.length * scale / 2, dimensions.width * scale / 2],
        [dimensions.length * scale / 2, dimensions.width * scale / 2]
      ];
      
      corners.forEach(([x, y]) => {
        cleats.push({
          position: [x + cleatSize / 2, y + cleatSize / 2, dimensions.height * scale / 2],
          dimensions: [cleatSize, cleatSize, dimensions.height * scale * 0.8]
        });
      });
    }
    
    return { skids, panels, cleats };
  }, [config, componentVisibility, currentLOD]);

  // Floor component
  const floorComponent = useMemo(() => {
    if (!componentVisibility.floor) return null;
    
    const { dimensions, base } = config;
    const scale = 0.01;
    
    return {
      position: [0, 0, (base.skidHeight + base.floorboardThickness / 2) * scale] as [number, number, number],
      dimensions: [dimensions.length * scale, dimensions.width * scale, base.floorboardThickness * scale] as [number, number, number]
    };
  }, [config, componentVisibility.floor]);

  return (
    <group ref={groupRef}>
      {/* Skids using instancing */}
      {components.skids.length > 0 && (
        <InstancedBoxes
          instances={components.skids}
          material={MATERIALS.skid}
          explodeFactor={explodeFactor}
          componentType="skid"
          onHover={onHover}
          onHoverEnd={onHoverEnd}
        />
      )}
      
      {/* Floor */}
      {floorComponent && (
        <mesh
          position={floorComponent.position}
          material={MATERIALS.floor}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover('floor', floorComponent.dimensions, floorComponent.position);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onHoverEnd();
          }}
        >
          <boxGeometry args={floorComponent.dimensions} />
        </mesh>
      )}
      
      {/* Panels with LOD */}
      {components.panels.map((panel, index) => (
        <OptimizedPanel
          key={`panel-${index}`}
          position={panel.position}
          dimensions={panel.dimensions}
          material={MATERIALS.panel}
          explodeFactor={explodeFactor}
          label={panel.label}
          showLabel={showFaceLabels}
          lod={currentLOD}
        />
      ))}
      
      {/* Cleats using instancing (only in high LOD) */}
      {components.cleats.length > 0 && currentLOD === 'high' && (
        <InstancedBoxes
          instances={components.cleats}
          material={MATERIALS.cleat}
          explodeFactor={explodeFactor}
          componentType="cleat"
          onHover={onHover}
          onHoverEnd={onHoverEnd}
        />
      )}
      
      {/* CoG indicator */}
      {componentVisibility.cog && config.centerOfGravity && (
        <mesh position={[
          (config.centerOfGravity.combinedCoG?.x || 0) * 0.01,
          (config.centerOfGravity.combinedCoG?.y || 0) * 0.01,
          (config.centerOfGravity.combinedCoG?.z || 0) * 0.01
        ]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshBasicMaterial color={0xff0000} />
        </mesh>
      )}
      
      {/* WCS axes */}
      {showWCS && (
        <axesHelper args={[1]} />
      )}
      
      {/* Measurements */}
      {showMeasurements && currentLOD === 'high' && (
        <Html position={[0, 0, -1]} center>
          <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
            {config.dimensions.length}" × {config.dimensions.width}" × {config.dimensions.height}"
          </div>
        </Html>
      )}
    </group>
  );
};