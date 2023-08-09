import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import * as THREE from 'three';

export function createControls(camera: THREE.Camera, view: HTMLDivElement) {
  const controls = new OrbitControls(camera, view) as any;
  // controls.target.set(10, 10, 0);

  // controls.listenToKeyEvents(window);

  return controls;
}
