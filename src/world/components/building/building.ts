import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { setupModel } from './setup-model.js';

export async function loadBuilding(glb: string) {
  const loader = new GLTFLoader();
  // dev
  // const data = await loader.loadAsync('/assets/tw/glb/building.glb');
  // // prod
  // const data = await loader.loadAsync(
  //   'https://cbosv3-sandbox.oss-cn-hongkong.aliyuncs.com/test-glb/building.glb?v=1'
  // );

  const data = await loader.loadAsync(glb);

  const building = setupModel(data);
  // console.log(building);

  return building;
}
