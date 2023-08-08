import { Scene } from 'three';

export function createScene() {
  const scene = new Scene();

  // scene.background = new Color(Color.NAMES.skyblue);
  // scene.background = new Color('skyblue');
  // scene.background = new Color(0x87ceeb);
  // scene.background = new Color('#87ceeb');

  return scene;
}
