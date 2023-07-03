import * as THREE from 'three';
import { Tree } from '../type.js';
import { Gui } from './Gui.js';

let _gui: Gui;

export const getUniqueGui = (
  controlView: HTMLDivElement,
  mainLight: THREE.DirectionalLight,
  secondLight: THREE.HemisphereLight,
  mainCamera: THREE.PerspectiveCamera,
  tree: Tree[]
) => {
  if (!_gui) {
    _gui = new Gui(controlView, mainLight, secondLight, mainCamera, tree);
  }
  return _gui;
};

export { Gui };
