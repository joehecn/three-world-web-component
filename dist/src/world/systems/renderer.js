import { WebGLRenderer } from 'three';
export function createRenderer(canvas) {
    const renderer = new WebGLRenderer({ antialias: true, canvas });
    // renderer.useLegacyLights = true
    return renderer;
}
//# sourceMappingURL=renderer.js.map