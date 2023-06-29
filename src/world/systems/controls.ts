import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import * as THREE from 'three';

export function createControls(camera: THREE.Camera, mainView: HTMLDivElement) {
  const controls = new OrbitControls(camera, mainView) as any;

  // controls.enableDamping = true;

  // controls.tick = () => controls.update();

  controls.listenToKeyEvents(window);

  // controls.minAzimuthAngle = -Infinity; // default
  // controls.maxAzimuthAngle = Infinity; // default

  // controls.minPolarAngle = 0; // default
  // controls.maxPolarAngle = Math.PI; // default

  return controls;
}
