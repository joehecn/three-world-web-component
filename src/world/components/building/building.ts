import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { setupModel } from './setup-model.js';

export async function loadBuilding(path: string) {
  const loader = new GLTFLoader();

  const data = await loader.loadAsync(path);

  const building = setupModel(data);

  return building;
}
