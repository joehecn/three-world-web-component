import { Clock } from 'three';

import * as THREE from 'three';

const clock = new Clock();

export class Loop {
  private _scene: THREE.Scene;

  private _camera: THREE.PerspectiveCamera;

  private _renderer: THREE.WebGLRenderer;

  private _updatables: any = [];

  constructor(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer
  ) {
    this._scene = scene;
    this._camera = camera;
    this._renderer = renderer;
  }

  start() {
    this._renderer.setAnimationLoop(() => {
      // Tell every animated object to tick forward one frame
      this.tick();

      // Render a frame
      this._renderer.render(this._scene, this._camera);
    });
  }

  stop() {
    this._renderer.setAnimationLoop(null);
  }

  pushUpdatable(obj: any) {
    this._updatables.push(obj);
  }

  tick() {
    // only call the getDelta function once per frame!
    const delta = clock.getDelta();

    for (const obj of this._updatables) {
      obj.tick(delta);
    }
  }
}
