import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { setupModel } from './setup-model.js';

export async function loadBuilding(glb: string) {
  const loader = new GLTFLoader();

  const data = await loader.loadAsync(glb);

  const building = setupModel(data);

  return building;
}
