import * as THREE from 'three';
import { Gui } from './Gui.js';

// let _gui: Gui;

export const getUniqueGui = (
  controlView: HTMLDivElement,
  mainLight: THREE.DirectionalLight,
  secondLight: THREE.HemisphereLight,
  mainCamera: THREE.PerspectiveCamera,
  secondCamera: THREE.PerspectiveCamera,
  view: 'config' | 'edit' | 'read'
) => {
  // if (!_gui) {
  const _gui = new Gui(
    controlView,
    mainLight,
    secondLight,
    mainCamera,
    secondCamera,
    view
  );
  // }
  return _gui;
};

export { Gui };
