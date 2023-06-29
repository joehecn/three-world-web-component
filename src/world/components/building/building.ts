import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { setupModel } from './setup-model.js';

export async function loadBuilding() {
  const loader = new GLTFLoader();
  const data = await loader.loadAsync('/assets/tw/glb/building.glb');

  // console.log('---- loadBuilding', data);

  const building = setupModel(data);
  // console.log('---- building', building);

  return building;
}
