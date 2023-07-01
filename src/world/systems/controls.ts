import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import * as THREE from 'three';

export function createControls(camera: THREE.Camera, view: HTMLDivElement) {
  const controls = new OrbitControls(camera, view) as any;

  controls.listenToKeyEvents(window);

  return controls;
}
