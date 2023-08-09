import { WebGLRenderer } from 'three';

export function createRenderer(canvas: HTMLCanvasElement) {
  const _renderer = new WebGLRenderer({ antialias: true, canvas });
  return _renderer;
}
