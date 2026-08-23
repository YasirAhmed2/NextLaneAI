import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PathwayMilestone, Opportunity } from '../types';

interface Pathways3DVisualizerProps {
  milestones: PathwayMilestone[];
  selectedMilestoneId: string;
  onSelectMilestone: (id: string) => void;
  theme?: 'dark' | 'light';
}

export const Pathways3DVisualizer: React.FC<Pathways3DVisualizerProps> = ({
  milestones,
  selectedMilestoneId,
  onSelectMilestone,
  theme = 'dark'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 4, 18);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const isDark = theme === 'dark';
    const primaryColor = isDark ? 0xD4AF37 : 0xB38600;
    const activeColor = 0xD4AF37;
    const completedColor = 0x60a5fa;
    const upcomingColor = isDark ? 0x9ca3af : 0x64748b;
    const wireColor = isDark ? 0x3c3c3b : 0xe2e8f0;

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Grid plane / Matrix Ring
    const ringsGroup = new THREE.Group();
    mainGroup.add(ringsGroup);

    for (let r = 5; r <= 14; r += 3) {
      const ringGeo = new THREE.RingGeometry(r - 0.02, r, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: wireColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isDark ? 0.35 : 0.4
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringsGroup.add(ringMesh);
    }

    // 2. Trajectory Spline Curve connecting milestones
    const nodeCount = milestones.length;
    const milestonePoints: THREE.Vector3[] = [];
    const milestoneMeshes: { mesh: THREE.Mesh; id: string; halo: THREE.Mesh }[] = [];

    milestones.forEach((m, idx) => {
      const angle = (idx / (nodeCount - 1 || 1)) * Math.PI * 0.9 - Math.PI * 0.45;
      const radius = 8.5;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * (radius * 0.6) - 3;
      const y = Math.sin(idx * 0.8) * 1.5 - (idx * 0.4);
      const pos = new THREE.Vector3(x, y, z);
      milestonePoints.push(pos);

      // Sphere Node
      const isSelected = m.id === selectedMilestoneId;
      const nodeGeo = new THREE.SphereGeometry(isSelected ? 0.9 : 0.65, 32, 32);
      
      let nodeCol = upcomingColor;
      if (m.status === 'completed') nodeCol = completedColor;
      if (m.status === 'in_progress' || isSelected) nodeCol = activeColor;

      const nodeMat = new THREE.MeshStandardMaterial({
        color: nodeCol,
        roughness: 0.2,
        metalness: 0.8,
        emissive: nodeCol,
        emissiveIntensity: isSelected ? 0.6 : 0.2
      });

      const mesh = new THREE.Mesh(nodeGeo, nodeMat);
      mesh.position.copy(pos);
      mesh.userData = { id: m.id, title: m.title, stage: m.stage };
      mainGroup.add(mesh);

      // Pulsating Halo for Active/Selected
      const haloGeo = new THREE.RingGeometry(0.8, 1.2, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: nodeCol,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isSelected ? 0.7 : 0.2
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.copy(pos);
      halo.lookAt(camera.position);
      mainGroup.add(halo);

      milestoneMeshes.push({ mesh, id: m.id, halo });
    });

    // Spline Tube
    const curve = new THREE.CatmullRomCurve3(milestonePoints);
    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.08, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: isDark ? 0.6 : 0.5
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    mainGroup.add(tubeMesh);

    // 3. Floating Data Particles along curve
    const particleCount = 28;
    const particleGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const particleMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9
    });
    const particles: { mesh: THREE.Mesh; progress: number; speed: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      const pMesh = new THREE.Mesh(particleGeo, particleMat);
      const prog = Math.random();
      const pt = curve.getPoint(prog);
      pMesh.position.copy(pt);
      mainGroup.add(pMesh);
      particles.push({
        mesh: pMesh,
        progress: prog,
        speed: 0.0015 + Math.random() * 0.002
      });
    }

    // 4. Background Starfield / Neural Nodes
    const starCount = 90;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 40;
      starPositions[i + 1] = (Math.random() - 0.5) * 20;
      starPositions[i + 2] = (Math.random() - 0.5) * 30 - 5;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: primaryColor,
      size: 0.4,
      transparent: true,
      opacity: isDark ? 0.35 : 0.25
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.8 : 1.2);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(primaryColor, 2, 50);
    pointLight1.position.set(5, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x60a5fa, 1.5, 40);
    pointLight2.position.set(-8, -5, 5);
    scene.add(pointLight2);

    // Raycasting for interactive click & hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(milestoneMeshes.map(m => m.mesh));
      if (intersects.length > 0) {
        const id = intersects[0].object.userData.id;
        setHoveredNode(id);
        container.style.cursor = 'pointer';
      } else {
        setHoveredNode(null);
        container.style.cursor = 'grab';
      }
    };

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(milestoneMeshes.map(m => m.mesh));
      if (intersects.length > 0) {
        const id = intersects[0].object.userData.id;
        onSelectMilestone(id);
      }
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('click', handleClick);

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        const height = entry.contentRect.height;
        if (width > 0 && height > 0) {
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        }
      }
    });
    resizeObserver.observe(container);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Gentle oscillation
      mainGroup.rotation.y = Math.sin(elapsed * 0.25) * 0.15;
      mainGroup.rotation.x = Math.cos(elapsed * 0.2) * 0.06;

      // Update particle stream
      particles.forEach((p) => {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;
        const pt = curve.getPoint(p.progress);
        p.mesh.position.copy(pt);
      });

      // Update halos
      milestoneMeshes.forEach((item) => {
        item.halo.lookAt(camera.position);
        if (item.id === selectedMilestoneId) {
          const scale = 1 + Math.sin(elapsed * 3) * 0.15;
          item.halo.scale.set(scale, scale, scale);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('click', handleClick);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [milestones, selectedMilestoneId, theme]);

  return (
    <div className="relative w-full h-72 sm:h-80 md:h-96 rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--bg-subtle)]">
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating HUD Overlay */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 pointer-events-none flex items-center gap-2 max-w-[85%]">
        <div className="px-2.5 sm:px-3 py-1 rounded-full bg-[var(--card-bg)]/90 backdrop-blur-md border border-[var(--border)] shadow-xs flex items-center gap-2 truncate">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37] shrink-0"></span>
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#B38600] dark:text-[#D4AF37] truncate">
            Interactive 3D Trajectory Neural Map
          </span>
        </div>
      </div>

      <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 pointer-events-none flex items-center gap-3">
        <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-[var(--card-bg)]/85 backdrop-blur-md border border-[var(--border)] text-[10px] sm:text-[11px] text-[var(--text-secondary)] flex items-center gap-1.5 sm:gap-2 shadow-xs">
          <span className="material-symbols-outlined text-xs text-[#B38600] dark:text-[#D4AF37]">touch_app</span>
          <span>Click node to inspect</span>
        </div>
      </div>

      {hoveredNode && (
        <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 pointer-events-none animate-in fade-in zoom-in-95 duration-150 max-w-[60%]">
          <div className="px-3 py-1.5 rounded-xl bg-[#D4AF37] text-[#1C1C1C] font-bold text-xs shadow-md truncate">
            {milestones.find(m => m.id === hoveredNode)?.title}
          </div>
        </div>
      )}
    </div>
  );
};
