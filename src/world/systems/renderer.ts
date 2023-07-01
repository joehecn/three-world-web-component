import { WebGLRenderer } from 'three';

export function createRenderer(canvas: HTMLCanvasElement) {
  const renderer = new WebGLRenderer({ antialias: true, canvas });

  return renderer;
}
