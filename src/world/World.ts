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

export class World {
  private _scene: THREE.Scene;

  private _mainCamera: THREE.PerspectiveCamera;

  private _secondCamera: THREE.PerspectiveCamera;

  private _renderer: THREE.WebGLRenderer;

  private _mainView: HTMLDivElement;

  private _secondView: HTMLDivElement;

  private _lightHelper: THREE.DirectionalLightHelper;

  private _cameraHelper: THREE.CameraHelper;

  private _axesHelper: THREE.AxesHelper;

  private _tree: Tree[];

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

    this._scene.add(
      mainLight,
      secondLight,
      this._lightHelper,
      this._cameraHelper,
      this._axesHelper
    );
  }

  public async init() {
    const building = await loadBuilding();
    this._scene.add(building);

    this.render();
  }

  public toolAction(toolData: ToolData) {
    // console.log(toolData);
    const { group, actived } = toolData;

    if (group === 'setting') {
      this._axesHelper.visible = !!actived;
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
