import * as THREE from 'three';

export class PickHelper {
  private _raycaster: THREE.Raycaster;

  constructor() {
    this._raycaster = new THREE.Raycaster();
  }

  pick(
    normalizedPosition: THREE.Vector2,
    children: THREE.Object3D[],
    camera: THREE.Camera
  ) {
    // 发出射线
    this._raycaster.setFromCamera(normalizedPosition, camera);
    // 获取与射线相交的对象
    const intersectedObjects = this._raycaster.intersectObjects(children, true);

    if (intersectedObjects.length > 0) return intersectedObjects[0];

    return null;
  }
}
