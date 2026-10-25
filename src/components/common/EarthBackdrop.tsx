import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { clamp, earthPose } from '../../utils/earthMotion';

/** Supplied Earth model, animated with the reference's scroll keyframes. */
export default function EarthBackdrop() {
  const host = useRef<HTMLDivElement>(null);
  const photo = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = host.current, fallback = photo.current;
    if (!element || !fallback) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false, frame = 0, previous = 0, entryStart = performance.now();
    let width = window.innerWidth, height = window.innerHeight;
    let target = 0, progress = 0, spin = 0;
    let pose = earthPose(0, width);
    let renderer: THREE.WebGLRenderer | undefined;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, .1, 100);
    camera.position.set(0, 0, 8);
    scene.add(new THREE.AmbientLight(0xffffff, 1.8));
    const sun = new THREE.DirectionalLight(0xffffff, .8);
    sun.position.set(0, 10, 2); scene.add(sun);
    const world = new THREE.Group(), planet = new THREE.Group();
    planet.rotation.z = .37; world.add(planet); scene.add(world);
    const draco = new DRACOLoader().setDecoderPath('/models/');
    const release = (object: THREE.Object3D) => object.traverse(child => {
      if (!(child instanceof THREE.Mesh)) return;
      child.geometry.dispose();
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach(material => {
        Object.values(material).forEach(value => { if (value instanceof THREE.Texture) value.dispose(); });
        material.dispose();
      });
    });
    const readScroll = () => {
      target = clamp(window.scrollY / Math.max(1, document.documentElement.scrollHeight - height));
      start();
    };
    const draw = (now: number) => {
      frame = 0;
      if (disposed || document.hidden) return;
      const dt = Math.min((now - (previous || now)) / 1000, .05); previous = now;
      progress = reduced.matches ? 0 : progress + (target - progress) * Math.min(1, dt * 4.5);
      const next = earthPose(progress, width);
      const k = reduced.matches ? 1 : Math.min(1, dt * 3.2);
      pose = { x: pose.x + (next.x - pose.x) * k, y: pose.y + (next.y - pose.y) * k, scale: pose.scale + (next.scale - pose.scale) * k, rotation: next.rotation };
      const entry = reduced.matches ? 0 : -2 * Math.pow(1 - clamp((now - entryStart) / 1900), 3);
      if (!reduced.matches) spin += dt * .03;
      world.position.set(pose.x, pose.y + entry, 0);
      world.scale.setScalar(pose.scale);
      planet.rotation.y = pose.rotation + spin;
      // The photo uses the same camera projection and motion when WebGL is unavailable.
      const unit = height / (2 * Math.tan(Math.PI / 9) * 8);
      const diameter = 3.9 * unit;
      fallback.style.width = fallback.style.height = `${diameter}px`;
      fallback.style.transform = `translate(-50%, -50%) translate(${pose.x * unit}px, ${-(pose.y + entry) * unit}px) scale(${pose.scale}) rotate(${reduced.matches ? 0 : progress * 18}deg)`;
      element.style.setProperty('--earth-opacity', String(.94 - .6 * clamp(progress / .16)));
      element.dataset.motion = reduced.matches ? 'reduced' : 'scroll';
      element.dataset.progress = progress.toFixed(3);
      renderer?.render(scene, camera);
      if (!reduced.matches) frame = requestAnimationFrame(draw);
    };
    function start() { if (!frame && !disposed && !document.hidden) frame = requestAnimationFrame(draw); }
    const resize = () => {
      width = element.clientWidth; height = element.clientHeight;
      camera.aspect = width / Math.max(height, 1); camera.updateProjectionMatrix();
      renderer?.setSize(width, height); readScroll();
    };
    const visibility = () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
      else { previous = 0; readScroll(); }
    };
    const preference = () => { previous = 0; readScroll(); };
    try {
      renderer = new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputEncoding = THREE.sRGBEncoding; renderer.setClearColor(0x04060f, 0);
      element.appendChild(renderer.domElement);
      new GLTFLoader().setDRACOLoader(draco).load('/models/planet.glb', gltf => {
        if (disposed) { release(gltf.scene); return; }
        const bounds = new THREE.Box3().setFromObject(gltf.scene);
        const size = bounds.getSize(new THREE.Vector3());
        gltf.scene.position.sub(bounds.getCenter(new THREE.Vector3()));
        const model = new THREE.Group(); model.add(gltf.scene);
        model.scale.setScalar(3.9 / Math.max(size.x, size.y, size.z)); planet.add(model);
        element.dataset.loaded = 'true'; start();
      }, undefined, () => { element.dataset.loaded = 'false'; });
    } catch { element.dataset.loaded = 'false'; }
    const observer = new ResizeObserver(resize); observer.observe(element);
    window.addEventListener('scroll', readScroll, {passive:true});
    document.addEventListener('visibilitychange', visibility);
    reduced.addEventListener('change', preference);
    resize();
    return () => {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect();
      window.removeEventListener('scroll', readScroll);
      document.removeEventListener('visibilitychange', visibility);
      reduced.removeEventListener('change', preference);
      release(world); draco.dispose(); renderer?.dispose(); renderer?.domElement.remove();
    };
  }, []);
  return <div ref={host} className="earth-backdrop" aria-hidden="true"><div ref={photo} className="earth-photo"><img className="earth-fallback" src="/models/earth-nasa.jpg" alt="" /></div></div>;
}
