import { EventDispatcher, BoxGeometry, MathUtils, Mesh, TextureLoader, MeshStandardMaterial, LoadingManager, } from 'three';
export class Node extends EventDispatcher {
    constructor() {
        super();
        this.mesh = this.__createMesh();
    }
    __createMesh() {
        // create a geometry
        const geometry = new BoxGeometry(20, 20, 20);
        const loadManager = new LoadingManager();
        loadManager.onLoad = () => {
            this.dispatchEvent({ type: 'load-ok' });
        };
        // create a texture loader.
        const loader = new TextureLoader(loadManager);
        // the texture we just loaded as a color map
        const material = new MeshStandardMaterial({
            map: loader.load('/assets/tw/textures/uv-test-bw.png'),
        });
        // create a Mesh containing the geometry and material
        const mesh = new Mesh(geometry, material);
        const radiansPerSecond = MathUtils.degToRad(30);
        // this method will be called once per frame
        mesh.tick = (delta) => {
            mesh.rotation.z += radiansPerSecond * delta;
            mesh.rotation.x += radiansPerSecond * delta;
            mesh.rotation.y += radiansPerSecond * delta;
        };
        return mesh;
    }
}
//# sourceMappingURL=Node.js.map