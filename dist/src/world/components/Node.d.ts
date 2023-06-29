import { EventDispatcher, Mesh } from 'three';
export declare class Node extends EventDispatcher {
    mesh: Mesh;
    constructor();
    private __createMesh;
}
