// visualization/PanelVisualizer.tsx
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

/**
 * Interface for a Plywood sheet in the panel.
 */
interface Plywood {
  id: string;
  position: THREE.Vector3;
  size: THREE.Vector3; // width, height, thickness
}

/**
 * Interface for Vinyl applied to the panel.
 */
interface Vinyl {
  id: string;
  material: THREE.Material; // e.g., color, texture
}

/**
 * Interface for Klimp or Stencil with STEP file support.
 */
interface ModelComponent {
  id: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  stepFile?: File; // Uploaded STEP file
  stlFile?: File; // Converted STL for visualization
  boundingBox: THREE.Box3; // For initial placement
}

/**
 * Props for the PanelVisualizer component.
 */
interface PanelVisualizerProps {
  plywoods: Plywood[];
  vinyl: Vinyl;
  klimps: ModelComponent[];
  stencils: ModelComponent[];
  useBoundingBoxes: boolean; // Flag to use bounding boxes instead of models
}

/**
 * PanelVisualizer component for rendering the crate panel with plywood, vinyl, klimps, and stencils.
 * Displays vinyl on the entire panel (all plywoods) and uses bounding boxes for initial STEP file placement.
 */
const PanelVisualizer: React.FC<PanelVisualizerProps> = ({
  plywoods,
  vinyl,
  klimps,
  stencils,
  useBoundingBoxes,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const controlsRef = useRef<OrbitControls>();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 10);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Render loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;

    const scene = sceneRef.current;

    // Clear previous objects
    scene.children = scene.children.filter(
      (child) => child.type === 'Light' || child.type === 'AmbientLight'
    );

    try {
      // Render plywoods
      plywoods.forEach((plywood) => {
        const geometry = new THREE.BoxGeometry(
          plywood.size.x,
          plywood.size.y,
          plywood.size.z
        );
        const material = new THREE.MeshLambertMaterial({ color: 0x8b4513 }); // Brown for wood
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(plywood.position);
        scene.add(mesh);

        // Apply vinyl to the entire panel (all plywoods)
        const vinylGeometry = new THREE.PlaneGeometry(plywood.size.x, plywood.size.y);
        const vinylMesh = new THREE.Mesh(vinylGeometry, vinyl.material);
        vinylMesh.position.copy(plywood.position);
        vinylMesh.position.z += plywood.size.z / 2 + 0.01; // Slightly above plywood
        scene.add(vinylMesh);
      });

      // Render klimps and stencils
      const components = [...klimps, ...stencils];
      components.forEach((component) => {
        if (useBoundingBoxes) {
          // Use bounding box for initial placement
          const boxGeometry = new THREE.BoxGeometry(
            component.boundingBox.max.x - component.boundingBox.min.x,
            component.boundingBox.max.y - component.boundingBox.min.y,
            component.boundingBox.max.z - component.boundingBox.min.z
          );
          const boxMaterial = new THREE.MeshLambertMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.5,
          });
          const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
          boxMesh.position.copy(component.position);
          boxMesh.rotation.copy(component.rotation);
          boxMesh.scale.copy(component.scale);
          scene.add(boxMesh);
        } else if (component.stlFile) {
          // Load and render STL model
          const loader = new STLLoader();
          loader.load(
            URL.createObjectURL(component.stlFile),
            (geometry) => {
              const material = new THREE.MeshLambertMaterial({ color: 0xff0000 });
              const mesh = new THREE.Mesh(geometry, material);
              mesh.position.copy(component.position);
              mesh.rotation.copy(component.rotation);
              mesh.scale.copy(component.scale);
              scene.add(mesh);
            },
            undefined,
            (err) => {
              setError(`Failed to load STL for ${component.id}: ${err.message}`);
            }
          );
        }
      });

      setError(null);
    } catch (err) {
      setError(`Error rendering panel: ${(err as Error).message}`);
    }
  }, [plywoods, vinyl, klimps, stencils, useBoundingBoxes]);

  return (
    <div>
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      <div ref={mountRef} style={{ width: '100%', height: '600px' }} />
    </div>
  );
};

export default PanelVisualizer;
