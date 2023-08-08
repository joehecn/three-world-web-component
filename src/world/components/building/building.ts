import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { setupModel } from './setup-model.js';

const _buildingCache = new Map();

export async function loadBuilding(path: string) {
  if (_buildingCache.has(path)) {
    return _buildingCache.get(path);
  }

  const loader = new GLTFLoader();

  const data = await loader.loadAsync(path);

  const building = setupModel(data);
  _buildingCache.set(path, building);

  return building;
}
