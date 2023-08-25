import * as THREE from 'three';
import { Gui } from './Gui.js';

// let _gui: Gui;

export const getUniqueGui = (
  controlView: HTMLDivElement,
  mainLight: THREE.DirectionalLight,
  secondLight: THREE.HemisphereLight,
  mainCamera: THREE.PerspectiveCamera,
  secondCamera: THREE.PerspectiveCamera
) => {
  // if (!_gui) {
  const _gui = new Gui(
    controlView,
    mainLight,
    secondLight,
    mainCamera,
    secondCamera
  );
  // }
  return _gui;
};

export { Gui };
