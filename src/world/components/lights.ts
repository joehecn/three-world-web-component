import { DirectionalLight, HemisphereLight } from 'three';

export function createLights() {
  // Create a directional light
  const mainLight = new DirectionalLight('#999', 1);

  // move the light right, up, and towards us
  mainLight.position.set(2, 6, 0);

  mainLight.target.position.set(0, 0, 0);

  const secondLight = new HemisphereLight('#ddd', 'darkslategrey', 1);

  return { mainLight, secondLight };
}
