import { WebGLRenderer } from 'three';

let _renderer: WebGLRenderer | null = null;

export function createRenderer(canvas: HTMLCanvasElement) {
  if (!_renderer) {
    _renderer = new WebGLRenderer({ antialias: true, canvas });
  }

  return _renderer;
}
