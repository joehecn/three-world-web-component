import { PerspectiveCamera } from 'three';
export function createCamera(option = [75, 2, 1, 600], position = [0, 160, 20], up = [0, 0, 1], lookAt = [0, 0, 0]) {
    // fov, // Field Of View (default 50)
    // aspect, // width / height ratio (default 1)
    // near, // near clipping plane (default 0.1)
    // far // far clipping plane (default 2000)
    const camera = new PerspectiveCamera(...option);
    // move the camera back so we can view the scene
    camera.position.set(...position);
    camera.up.set(...up);
    camera.lookAt(...lookAt);
    return camera;
}
//# sourceMappingURL=camera.js.map