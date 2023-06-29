import { WebGLRenderer } from 'three';

export function createRenderer(canvas: HTMLCanvasElement) {
  const renderer = new WebGLRenderer({ antialias: true, canvas });

  // renderer.useLegacyLights = true

  return renderer;
}
