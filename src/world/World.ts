import * as THREE from 'three';

import {
  createScene,
  createLights,
  createCamera,
  loadBuilding,
} from './components/index.js';

import {
  DirectionalLightHelper,
  CameraHelper,
  AxesHelper,
  PlaneHelper,
  GridHelper,
  PickHelper,
} from './helpers/index.js';

import {
  createRenderer,
  createControls,
  getUniqueResizer,
} from './systems/index.js';

import type { ToolData, Tree } from './type.js';
import { getUniqueGui } from './guis/index.js';

function __setScissorForElement(
  canvas: HTMLCanvasElement,
  elem: HTMLDivElement
) {
  const canvasRect = canvas.getBoundingClientRect();
  const elemRect = elem.getBoundingClientRect();

  // 计算canvas的尺寸
  const right = Math.min(elemRect.right, canvasRect.right) - canvasRect.left;
  const left = Math.max(0, elemRect.left - canvasRect.left);
  const bottom = Math.min(elemRect.bottom, canvasRect.bottom) - canvasRect.top;
  const top = Math.max(0, elemRect.top - canvasRect.top);

  const width = Math.min(canvasRect.width, right - left);
  const height = Math.min(canvasRect.height, bottom - top);

  // 设置剪函数以仅渲染一部分场景
  const positiveYUpBottom = canvasRect.height - bottom;

  // 返回aspect
  return {
    left,
    positiveYUpBottom,
    width,
    height,
  };
}

function __getCanvasRelativePosition(
  e: MouseEvent,
  canvas: HTMLCanvasElement,
  elem: HTMLDivElement
) {
  const { left, positiveYUpBottom, width, height } = __setScissorForElement(
    canvas,
    elem
  );

  const x = e.clientX - left;
  const y = e.clientY - positiveYUpBottom;

  if (x < 0 || y < 0 || x > width || y > height) return null;
  return { x, y, width, height };
}

export class World {
  private _scene: THREE.Scene;

  private _building!: THREE.Group;

  private _tree: Tree[];

  private _mainCamera: THREE.PerspectiveCamera;

  private _secondCamera: THREE.PerspectiveCamera;

  private _renderer: THREE.WebGLRenderer;

  private _mainView: HTMLDivElement;

  private _secondView: HTMLDivElement;

  private _lightHelper: THREE.DirectionalLightHelper;

  private _cameraHelper: THREE.CameraHelper;

  private _axesHelper: THREE.AxesHelper;

  private _planeHelper: THREE.PlaneHelper;

  private _gridHelper: THREE.GridHelper;

  private _pickHelper: PickHelper | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    mainView: HTMLDivElement,
    secondView: HTMLDivElement,
    controlView: HTMLDivElement,
    tree: Tree[]
  ) {
    this._mainView = mainView;
    this._secondView = secondView;
    this._tree = tree;

    this._renderer = createRenderer(canvas);
    this._scene = createScene();

    const { mainLight, secondLight } = createLights();

    const { width, height } = __setScissorForElement(
      this._renderer.domElement,
      this._mainView
    );

    const aspect = width / height;

    this._mainCamera = createCamera(
      [75, aspect, 1, 300] // option: [fov, aspect, near, far]
    );

    this._secondCamera = createCamera(
      [120, aspect, 1, 300], // option: [fov, aspect, near, far]
      [-90, 300, 30] // position: [x, y, z]
    );

    const gui = getUniqueGui(
      controlView,
      mainLight,
      secondLight,
      this._mainCamera,
      tree
    );
    gui.addEventListener('gui-change', this.render.bind(this));

    const mainControls = createControls(this._mainCamera, mainView);
    mainControls.addEventListener('change', this.render.bind(this));

    const secondControls = createControls(this._secondCamera, secondView);
    secondControls.addEventListener('change', this.render.bind(this));

    const resizer = getUniqueResizer(this._renderer.domElement);
    resizer.addEventListener('resizer-render', (e: any) => {
      const { clientWidth, clientHeight, needRender } = e.detail as {
        clientWidth: number;
        clientHeight: number;
        needRender: boolean;
      };
      this._renderer.setSize(clientWidth, clientHeight, false);
      if (needRender) this.render();
    });
    resizer.init();

    this._lightHelper = new DirectionalLightHelper(mainLight);
    this._cameraHelper = new CameraHelper(this._mainCamera);
    this._axesHelper = new AxesHelper(500);
    this._axesHelper.visible = false;

    this._planeHelper = new PlaneHelper(new THREE.Plane(), 1);
    this._planeHelper.visible = false;

    this._gridHelper = new GridHelper(10, 10);
    this._gridHelper.matrix.makeRotationX(Math.PI / 2);
    this._gridHelper.matrixAutoUpdate = false;
    this._planeHelper.add(this._gridHelper);

    this._scene.add(
      mainLight,
      secondLight,
      this._lightHelper,
      this._cameraHelper,
      this._axesHelper,
      this._planeHelper
    );
  }

  private __setPick = (e: MouseEvent) => {
    const canvas = this._renderer.domElement;
    const pos = __getCanvasRelativePosition(e, canvas, this._mainView);

    if (pos) {
      // 归一化 x, y 坐标
      const x = (pos.x / pos.width) * 2 - 1;
      const y = (pos.y / pos.height) * -2 + 1;

      const Vector2 = new THREE.Vector2(x, y);
      const curent = this._pickHelper!.pick(
        Vector2,
        this._building.children,
        this._mainCamera
      );
      if (!curent) {
        this._planeHelper.visible = false;
      } else {
        const { face, object, point } = curent;
        const plane = new THREE.Plane();

        const vA = new THREE.Vector3();
        const vB = new THREE.Vector3();
        const vC = new THREE.Vector3();
        const { geometry } = object as THREE.Mesh;
        const { position } = geometry.attributes;

        vA.fromBufferAttribute(position, face!.a);
        vB.fromBufferAttribute(position, face!.b);
        vC.fromBufferAttribute(position, face!.c);

        const { matrixWorld } = object;
        vA.applyMatrix4(matrixWorld);
        vB.applyMatrix4(matrixWorld);
        vC.applyMatrix4(matrixWorld);

        plane.setFromCoplanarPoints(vA, vB, vC);

        this._planeHelper.plane = plane;

        const local = this._planeHelper.worldToLocal(point.clone());
        this._gridHelper.matrix.setPosition(local);
        this._planeHelper.visible = true;
      }

      this.render();
    }
  };

  public async init(glb: string) {
    const building = await loadBuilding(glb);
    // console.log(building); // Group
    this._building = building;
    this._scene.add(building);

    this.render();
  }

  public toolAction(toolData: ToolData) {
    const { group, actived } = toolData;

    if (group === 'setting') {
      this._axesHelper.visible = !!actived;
      this.render();
      return;
    }

    if (group === 'operate') {
      if (actived === 'add') {
        // add listener
        this._pickHelper = new PickHelper();
        this._planeHelper.visible = true;
        window.addEventListener('mousemove', this.__setPick);
        this.render();
        return;
      }

      // remove listener
      this._pickHelper = null;
      this._planeHelper.visible = false;
      window.removeEventListener('mousemove', this.__setPick);

      if (actived === 'move') {
        // TODO: move
      }

      this.render();
    }
  }

  protected render() {
    this._renderer.setScissorTest(true);

    let aspect: number;

    {
      const { left, positiveYUpBottom, width, height } = __setScissorForElement(
        this._renderer.domElement,
        this._mainView
      );

      aspect = width / height;

      this._renderer.setScissor(left, positiveYUpBottom, width, height);
      this._renderer.setViewport(left, positiveYUpBottom, width, height);

      this._mainCamera.aspect = aspect;
      this._mainCamera.updateProjectionMatrix();

      this._lightHelper.visible = false;
      this._cameraHelper.visible = false;

      this._renderer.render(this._scene, this._mainCamera);
    }

    {
      this._secondView.style.height = `${
        this._secondView.clientWidth / aspect
      }px`;

      const { left, positiveYUpBottom, width, height } = __setScissorForElement(
        this._renderer.domElement,
        this._secondView
      );

      this._renderer.setScissor(left, positiveYUpBottom, width, height);
      this._renderer.setViewport(left, positiveYUpBottom, width, height);

      this._secondCamera.aspect = aspect;
      this._secondCamera.updateProjectionMatrix();

      this._lightHelper.visible = true;
      this._cameraHelper.visible = true;

      this._renderer.render(this._scene, this._secondCamera);
    }

    this._lightHelper.update();
    this._cameraHelper.update();
  }
}
