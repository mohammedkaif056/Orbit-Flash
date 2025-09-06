"use client";

import { useEffect, useRef, useState, useCallback } from 'react';

interface HeroCanvasProps {
  paused?: boolean;
  prefersReducedMotion?: boolean;
}

export default function HeroCanvas({ paused = false, prefersReducedMotion = false }: HeroCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const frameRef = useRef<number | undefined>(undefined);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const orbitsRef = useRef<any[]>([]);
  const clockRef = useRef<any>(null);

  // Check hardware capabilities
  const getPerformanceLevel = useCallback(() => {
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const memory = (navigator as any).deviceMemory || 4;
    
    if (hardwareConcurrency <= 4 || memory <= 4) {
      return 'low';
    }
    return 'high';
  }, []);

  // Handle page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    let mounted = true;

    const initThreeJS = async () => {
      try {
        // Check WebGL support
        if (!window.WebGLRenderingContext) {
          throw new Error('WebGL not supported');
        }

        // Dynamic import of Three.js
        const THREE = await import('three');

        if (!mounted) return;

        const performanceLevel = getPerformanceLevel();
        
        // Scene setup
        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x0e0f13, 10, 50);
        
        // Camera
        const camera = new THREE.PerspectiveCamera(
          75,
          mountRef.current!.clientWidth / mountRef.current!.clientHeight,
          0.1,
          1000
        );
        camera.position.z = 8;
        
        // Renderer
        const renderer = new THREE.WebGLRenderer({
          antialias: performanceLevel === 'high',
          alpha: true,
          powerPreference: 'high-performance'
        });
        renderer.setSize(mountRef.current!.clientWidth, mountRef.current!.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x0e0f13, 0);
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x9b8cff, 0.3);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffe89b, 0.8);
        directionalLight.position.set(2, 2, 5);
        scene.add(directionalLight);
        
        // Central core
        const coreGeometry = new THREE.SphereGeometry(0.3, 8, 6);
        const coreMaterial = new THREE.MeshStandardMaterial({
          color: 0x9b8cff,
          emissive: 0x9b8cff,
          emissiveIntensity: 0.3
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        scene.add(core);
        
        // Orbiting spheres
        const orbits: any[] = [];
        const orbitCount = performanceLevel === 'high' ? 12 : 8;
        
        for (let i = 0; i < orbitCount; i++) {
          const orbitGeometry = new THREE.SphereGeometry(0.08, 6, 4);
          const orbitMaterial = new THREE.MeshStandardMaterial({
            color: 0xffe89b,
            emissive: 0xffe89b,
            emissiveIntensity: 0.2
          });
          const orbitSphere = new THREE.Mesh(orbitGeometry, orbitMaterial);
          
          const radius = 2 + Math.random() * 1.5;
          const angle = (i / orbitCount) * Math.PI * 2;
          const height = (Math.random() - 0.5) * 0.5;
          
          orbitSphere.userData = {
            radius,
            angle,
            height,
            speed: 0.2 + Math.random() * 0.3,
            verticalSpeed: 0.1 + Math.random() * 0.2
          };
          
          orbits.push(orbitSphere);
          scene.add(orbitSphere);
        }
        
        // Store references
        sceneRef.current = scene;
        rendererRef.current = renderer;
        cameraRef.current = camera;
        orbitsRef.current = orbits;
        clockRef.current = new THREE.Clock();
        
        // Append to DOM
        mountRef.current!.appendChild(renderer.domElement);
        
        // Handle resize
        const handleResize = () => {
          if (!mountRef.current || !mounted) return;
          
          const width = mountRef.current.clientWidth;
          const height = mountRef.current.clientHeight;
          
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        };
        
        window.addEventListener('resize', handleResize);
        
        // Animation loop
        let lastFrameTime = 0;
        const targetFPS = performanceLevel === 'high' ? 60 : 30;
        const frameInterval = 1000 / targetFPS;
        
        const animate = (currentTime: number) => {
          if (!mounted || !isVisible || paused) {
            frameRef.current = requestAnimationFrame(animate);
            return;
          }
          
          if (currentTime - lastFrameTime >= frameInterval) {
            const deltaTime = clockRef.current.getDelta();
            
            if (!prefersReducedMotion) {
              // Animate orbiting spheres
              orbitsRef.current.forEach((sphere, index) => {
                const userData = sphere.userData;
                userData.angle += userData.speed * deltaTime;
                userData.height += userData.verticalSpeed * deltaTime * 0.5;
                
                sphere.position.x = Math.cos(userData.angle) * userData.radius;
                sphere.position.z = Math.sin(userData.angle) * userData.radius;
                sphere.position.y = Math.sin(userData.height) * 0.3;
                
                // Subtle rotation
                sphere.rotation.y += deltaTime * 0.5;
              });
              
              // Rotate core
              core.rotation.y += deltaTime * 0.2;
              core.rotation.x += deltaTime * 0.1;
            }
            
            renderer.render(scene, camera);
            lastFrameTime = currentTime;
          }
          
          frameRef.current = requestAnimationFrame(animate);
        };
        
        animate(0);
        
        return () => {
          window.removeEventListener('resize', handleResize);
        };
        
      } catch (err) {
        console.error('Three.js initialization failed:', err);
        if (mounted) {
          setError(err as Error);
        }
      }
    };

    initThreeJS();

    return () => {
      mounted = false;
      
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      // Cleanup Three.js resources
      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      
      if (sceneRef.current) {
        sceneRef.current.traverse((object: any) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((material: any) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
    };
  }, [paused, prefersReducedMotion, isVisible, getPerformanceLevel]);

  if (error) {
    throw error;
  }

  return (
    <div 
      ref={mountRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
      style={{ 
        background: 'transparent',
        pointerEvents: 'none' 
      }}
    />
  );
}