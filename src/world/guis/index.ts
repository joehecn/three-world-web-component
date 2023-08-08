import * as THREE from 'three';
import { Gui } from './Gui.js';

let _gui: Gui;

export const getUniqueGui = (
  controlView: HTMLDivElement,
  mainLight: THREE.DirectionalLight,
  secondLight: THREE.HemisphereLight,
  mainCamera: THREE.PerspectiveCamera
) => {
  if (!_gui) {
    _gui = new Gui(controlView, mainLight, secondLight, mainCamera);
  }
  return _gui;
};

export { Gui };
