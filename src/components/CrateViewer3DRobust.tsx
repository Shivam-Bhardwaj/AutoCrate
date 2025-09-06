'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CrateConfiguration } from '@/types/crate';

interface CrateViewer3DRobustProps {
  configuration: CrateConfiguration | null;
}

export default function CrateViewer3DRobust({ configuration }: CrateViewer3DRobustProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number>();
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    let cleanup: (() => void) | null = null;

    const initScene = async () => {
      try {
        // Clear any previous content
        if (mountRef.current) {
          mountRef.current.innerHTML = '';
        }

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf5f5f5);
        sceneRef.current = scene;

        // Camera setup
        const width = mountRef.current?.clientWidth || 800;
        const height = mountRef.current?.clientHeight || 600;
        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        camera.position.set(8, -8, 8);
        camera.up.set(0, 0, 1);
        camera.lookAt(0, 0, 0);

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: false,
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        rendererRef.current = renderer;

        if (mountRef.current) {
          mountRef.current.appendChild(renderer.domElement);
        }

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        scene.add(directionalLight);

        // Grid helper (XY plane for Z-up coordinate system)
        const gridHelper = new THREE.GridHelper(20, 20, 0xaaaaaa, 0xdddddd);
        gridHelper.rotation.x = Math.PI / 2;
        scene.add(gridHelper);

        // Axes helper (Red=X, Green=Y, Blue=Z)
        const axesHelper = new THREE.AxesHelper(3);
        scene.add(axesHelper);

        // Create crate based on configuration
        if (configuration?.dimensions) {
          const { dimensions, base } = configuration;

          // Use safe defaults and convert inches to meters (1 inch = 0.0254 meters)
          const length = Math.max(dimensions.length || 48, 1) * 0.0254;
          const width = Math.max(dimensions.width || 40, 1) * 0.0254;
          const height = Math.max(dimensions.height || 36, 1) * 0.0254;
          const skidHeight = Math.max(base?.skidHeight || 4, 0.1) * 0.0254;

          // Create main crate box
          const crateGeometry = new THREE.BoxGeometry(length, width, height);
          const crateMaterial = new THREE.MeshLambertMaterial({
            color: 0x8b4513,
            transparent: true,
            opacity: 0.8,
          });
          const crateMesh = new THREE.Mesh(crateGeometry, crateMaterial);
          crateMesh.position.set(0, 0, skidHeight + height / 2);
          crateMesh.castShadow = true;
          crateMesh.receiveShadow = true;
          scene.add(crateMesh);

          // Create skids
          const skidCount = Math.max(base?.skidCount || 3, 2);
          const skidWidth = Math.max(base?.skidWidth || 6, 1) * 0.0254;
          const skidSpacing = Math.max(base?.skidSpacing || 20, 1) * 0.0254;

          const skidGeometry = new THREE.BoxGeometry(skidWidth, width, skidHeight);
          const skidMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });

          for (let i = 0; i < skidCount; i++) {
            const skid = new THREE.Mesh(skidGeometry, skidMaterial);
            const totalSpan = (skidCount - 1) * skidSpacing;
            const xPos = -totalSpan / 2 + i * skidSpacing;
            skid.position.set(xPos, 0, skidHeight / 2);
            skid.castShadow = true;
            skid.receiveShadow = true;
            scene.add(skid);
          }
        } else {
          // Default placeholder crate
          const defaultGeometry = new THREE.BoxGeometry(1.2, 1.0, 0.9);
          const defaultMaterial = new THREE.MeshLambertMaterial({
            color: 0x8b4513,
            transparent: true,
            opacity: 0.8,
          });
          const defaultMesh = new THREE.Mesh(defaultGeometry, defaultMaterial);
          defaultMesh.position.set(0, 0, 0.6);
          defaultMesh.castShadow = true;
          defaultMesh.receiveShadow = true;
          scene.add(defaultMesh);

          // Default skids
          const skidGeometry = new THREE.BoxGeometry(0.15, 1.0, 0.1);
          const skidMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });

          for (let i = 0; i < 3; i++) {
            const skid = new THREE.Mesh(skidGeometry, skidMaterial);
            skid.position.set(-0.4 + i * 0.4, 0, 0.05);
            skid.castShadow = true;
            skid.receiveShadow = true;
            scene.add(skid);
          }
        }

        // Mouse controls
        let mouseX = 0;
        let mouseY = 0;
        let isMouseDown = false;

        const handleMouseMove = (event: MouseEvent) => {
          if (!mountRef.current) return;
          const rect = mountRef.current.getBoundingClientRect();
          mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        };

        const handleMouseDown = () => {
          isMouseDown = true;
        };
        const handleMouseUp = () => {
          isMouseDown = false;
        };

        if (mountRef.current) {
          mountRef.current.addEventListener('mousemove', handleMouseMove);
          mountRef.current.addEventListener('mousedown', handleMouseDown);
          mountRef.current.addEventListener('mouseup', handleMouseUp);
        }

        // Animation loop
        const animate = () => {
          const animationId = requestAnimationFrame(animate);
          frameRef.current = animationId;

          // Simple orbit controls
          const radius = 12;
          const speed = isMouseDown ? 0.5 : 0.1;
          camera.position.x = Math.cos(mouseX * Math.PI * speed) * radius;
          camera.position.y = Math.sin(mouseX * Math.PI * speed) * radius;
          camera.position.z = 8 + mouseY * 4;
          camera.lookAt(0, 0, 2);

          renderer.render(scene, camera);
        };
        animate();

        // Handle window resize
        const handleResize = () => {
          if (!mountRef.current) return;
          const width = mountRef.current.clientWidth;
          const height = mountRef.current.clientHeight;
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        };
        window.addEventListener('resize', handleResize);

        // Cleanup function
        cleanup = () => {
          if (frameRef.current) {
            cancelAnimationFrame(frameRef.current);
          }
          if (mountRef.current && renderer.domElement) {
            mountRef.current.removeEventListener('mousemove', handleMouseMove);
            mountRef.current.removeEventListener('mousedown', handleMouseDown);
            mountRef.current.removeEventListener('mouseup', handleMouseUp);
            if (mountRef.current.contains(renderer.domElement)) {
              mountRef.current.removeChild(renderer.domElement);
            }
          }
          window.removeEventListener('resize', handleResize);
          renderer.dispose();
          scene.clear();
        };

        setIsReady(true);
        setError(null);
      } catch (err) {
        console.error('Error initializing 3D viewer:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize 3D viewer');
        setIsReady(false);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initScene, 100);

    return () => {
      clearTimeout(timer);
      if (cleanup) {
        cleanup();
      }
    };
  }, [configuration]);

  if (error) {
    return (
      <div className="w-full h-full bg-red-50 rounded-lg flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-red-600 font-semibold mb-2">3D Viewer Error</p>
          <p className="text-sm text-gray-600">{error}</p>
          <button
            className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Loading 3D Viewer...</p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg relative">
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute bottom-4 left-4 text-xs text-gray-500">
        Click + drag to rotate • Robust Three.js
      </div>
    </div>
  );
}
