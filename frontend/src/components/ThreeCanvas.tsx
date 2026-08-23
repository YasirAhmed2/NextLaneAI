import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeCanvasProps {
  theme?: 'dark' | 'light';
  className?: string;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  theme = 'dark',
  className = ''
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    
    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 24;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group for whole rotating scene
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Group for mouse parallax
    const interactiveGroup = new THREE.Group();
    mainGroup.add(interactiveGroup);

    const isDark = theme === 'dark';
    const primaryColor = isDark ? 0xf3c471 : 0xd97706;
    const secondaryColor = isDark ? 0xf59e0b : 0xb45309;
    const nodeColor = isDark ? 0xffdf9e : 0xf59e0b;
    const wireColor = isDark ? 0x524838 : 0xd6c29e;

    // 1. Core Polyhedron (Neural Node Sphere)
    const sphereGeo = new THREE.IcosahedronGeometry(7.5, 2);
    const wireMat = new THREE.MeshBasicMaterial({
      color: wireColor,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.28 : 0.25
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, wireMat);
    interactiveGroup.add(sphereMesh);

    // 2. Inner Ring / Quantum Orbital Rings
    const ringGeo1 = new THREE.TorusGeometry(9.5, 0.03, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: isDark ? 0.45 : 0.35
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    interactiveGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(11, 0.02, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: secondaryColor,
      transparent: true,
      opacity: isDark ? 0.35 : 0.25
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 3;
    interactiveGroup.add(ring2);

    // 3. Floating Opportunity Nodes (Glowing Vertices)
    const nodeCount = 42;
    const nodePositions = new Float32Array(nodeCount * 3);
    const nodeColors = new Float32Array(nodeCount * 3);
    const colorA = new THREE.Color(primaryColor);
    const colorB = new THREE.Color(nodeColor);

    const posAttr = sphereGeo.attributes.position;
    for (let i = 0; i < nodeCount; i++) {
      const idx = Math.floor(Math.random() * posAttr.count);
      const x = posAttr.getX(idx) * (1 + (Math.random() - 0.5) * 0.2);
      const y = posAttr.getY(idx) * (1 + (Math.random() - 0.5) * 0.2);
      const z = posAttr.getZ(idx) * (1 + (Math.random() - 0.5) * 0.2);

      nodePositions[i * 3] = x;
      nodePositions[i * 3 + 1] = y;
      nodePositions[i * 3 + 2] = z;

      const mixed = colorA.clone().lerp(colorB, Math.random());
      nodeColors[i * 3] = mixed.r;
      nodeColors[i * 3 + 1] = mixed.g;
      nodeColors[i * 3 + 2] = mixed.b;
    }

    const nodesGeo = new THREE.BufferGeometry();
    nodesGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
    nodesGeo.setAttribute('color', new THREE.BufferAttribute(nodeColors, 3));

    // Custom circle particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.3, 'rgba(243, 196, 113, 0.8)');
      gradient.addColorStop(0.8, 'rgba(243, 196, 113, 0.2)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    const nodesMat = new THREE.PointsMaterial({
      size: 0.8,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false
    });
    const nodesMesh = new THREE.Points(nodesGeo, nodesMat);
    interactiveGroup.add(nodesMesh);

    // 4. Background Starfield Constellations
    const starCount = 300;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 80;
      starPositions[i + 1] = (Math.random() - 0.5) * 60;
      starPositions[i + 2] = (Math.random() - 0.5) * 50 - 5;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.35,
      color: isDark ? 0xd4af37 : 0xb45309,
      transparent: true,
      opacity: isDark ? 0.4 : 0.25,
      map: particleTexture,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false
    });
    const starMesh = new THREE.Points(starGeo, starMat);
    mainGroup.add(starMesh);

    // Mouse movement interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = event.clientX - rect.left;
      const clientY = event.clientY - rect.top;
      mouseX = (clientX / rect.width) * 2 - 1;
      mouseY = -(clientY / rect.height) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse damping
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;

      // Base rotation
      sphereMesh.rotation.y = elapsedTime * 0.07;
      sphereMesh.rotation.x = Math.sin(elapsedTime * 0.05) * 0.2;

      ring1.rotation.z = elapsedTime * 0.1;
      ring1.rotation.y = Math.PI / 6 + Math.sin(elapsedTime * 0.08) * 0.15;

      ring2.rotation.z = -elapsedTime * 0.08;
      ring2.rotation.x = -Math.PI / 4 + Math.cos(elapsedTime * 0.06) * 0.15;

      nodesMesh.rotation.y = elapsedTime * 0.07;
      nodesMesh.rotation.x = Math.sin(elapsedTime * 0.05) * 0.2;

      // Starfield slow drift
      starMesh.rotation.y = elapsedTime * 0.015;

      // Parallax response
      interactiveGroup.rotation.y = targetX * 0.45;
      interactiveGroup.rotation.x = -targetY * 0.35;
      interactiveGroup.position.x = targetX * 1.5;
      interactiveGroup.position.y = targetY * 1.0;

      // Gentle pulsing scale
      const pulse = 1 + Math.sin(elapsedTime * 1.2) * 0.02;
      sphereMesh.scale.set(pulse, pulse, pulse);

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Dispose geometries and materials
      sphereGeo.dispose();
      wireMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      nodesGeo.dispose();
      nodesMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      particleTexture.dispose();
      renderer.dispose();
    };
  }, [theme]);

  return (
    <div
      ref={mountRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden max-w-full ${className}`}
      style={{ zIndex: 1 }}
    />
  );
};
