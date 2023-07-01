import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { setupModel } from './setup-model.js';

export async function loadBuilding() {
  const loader = new GLTFLoader();
  // const data = await loader.loadAsync('/assets/tw/glb/building.glb');
  const data = await loader.loadAsync(
    'https://cbosv3-sandbox.oss-cn-hongkong.aliyuncs.com/test-glb/building.glb'
  );

  const building = setupModel(data);
  // console.log(building);

  return building;
}
