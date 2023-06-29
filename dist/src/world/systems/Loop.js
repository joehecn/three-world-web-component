import { Clock } from 'three';
const clock = new Clock();
export class Loop {
    constructor(scene, camera, renderer) {
        this._updatables = [];
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
    pushUpdatable(obj) {
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
//# sourceMappingURL=Loop.js.map