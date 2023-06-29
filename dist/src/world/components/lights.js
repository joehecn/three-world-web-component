import { DirectionalLight, HemisphereLight } from 'three';
export function createLights() {
    // Create a directional light
    const mainLight = new DirectionalLight('white', 1);
    // move the light right, up, and towards us
    mainLight.position.set(200, 200, 200);
    mainLight.target.position.set(0, 0, 0);
    const secondLight = new HemisphereLight('white', 'darkslategrey', 1);
    return { mainLight, secondLight };
}
//# sourceMappingURL=lights.js.map