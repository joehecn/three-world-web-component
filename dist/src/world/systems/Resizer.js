import { EventDispatcher } from 'three';
const _setSize = (renderer) => {
    const canvas = renderer.domElement;
    const pixelRatio = 1; // window.devicePixelRatio;
    const width = canvas.clientWidth * pixelRatio || 0;
    const height = canvas.clientHeight * pixelRatio || 0;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
};
export class Resizer extends EventDispatcher {
    constructor(renderer) {
        super();
        // set initial size
        _setSize(renderer);
        // resize if the window is resized
        window.addEventListener('resize', () => {
            const needResize = _setSize(renderer);
            if (needResize) {
                this.dispatchEvent({ type: 'window-resize' });
            }
        });
    }
}
//# sourceMappingURL=Resizer.js.map