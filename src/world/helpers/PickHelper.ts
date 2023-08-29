import * as THREE from 'three';

export class PickHelper {
  private _raycaster: THREE.Raycaster;

  constructor() {
    // 这个类用于进行raycasting（光线投射）。 光线投射用于进行鼠标拾取（在三维空间中计算出鼠标移过了什么物体）。
    this._raycaster = new THREE.Raycaster();
  }

  pick(
    normalizedPosition: THREE.Vector2,
    children: THREE.Object3D[],
    camera: THREE.Camera
  ) {
    // 发出射线 通过摄像机和鼠标位置更新射线
    this._raycaster.setFromCamera(normalizedPosition, camera);
    // 获取与射线相交的对象
    const intersectedObjects = this._raycaster.intersectObjects(children, true);

    if (intersectedObjects.length > 0) return intersectedObjects[0];

    return null;
  }
}
