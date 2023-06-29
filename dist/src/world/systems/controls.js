import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
export function createControls(camera, mainView) {
    const controls = new OrbitControls(camera, mainView);
    // controls.enableDamping = true;
    // controls.tick = () => controls.update();
    controls.listenToKeyEvents(window);
    // controls.minAzimuthAngle = -Infinity; // default
    // controls.maxAzimuthAngle = Infinity; // default
    // controls.minPolarAngle = 0; // default
    // controls.maxPolarAngle = Math.PI; // default
    return controls;
}
//# sourceMappingURL=controls.js.map