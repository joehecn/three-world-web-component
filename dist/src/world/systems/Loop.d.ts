import * as THREE from 'three';
export declare class Loop {
    private _scene;
    private _camera;
    private _renderer;
    private _updatables;
    constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer);
    start(): void;
    stop(): void;
    pushUpdatable(obj: any): void;
    tick(): void;
}
