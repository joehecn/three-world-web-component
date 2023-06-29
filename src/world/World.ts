import { DirectionalLightHelper, CameraHelper } from 'three';

import * as THREE from 'three';

import GUI from 'lil-gui';
import {
  createScene,
  createLights,
  // Node,
  createCamera,
  loadBuilding,
} from './components/index.js';

import {
  createRenderer,
  createControls,
  Resizer,
  ColorGUIHelper,
  MinMaxGUIHelper,
} from './systems/index.js';

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

  constructor(
    canvas: HTMLCanvasElement,
    mainView: HTMLDivElement,
    secondView: HTMLDivElement,
    controlView: HTMLDivElement
  ) {
    this._mainView = mainView;
    this._secondView = secondView;

    this._renderer = createRenderer(canvas);
    this._scene = createScene();

    const { mainLight, secondLight } = createLights();

    let aspect = 2;

    {
      const { left, positiveYUpBottom, width, height } = __setScissorForElement(
        this._renderer.domElement,
        this._mainView
      );

      aspect = width / height;

      this._mainCamera = createCamera(
        [75, aspect, 1, 300] // option: [fov, aspect, near, far]
      );

      this._renderer.setScissor(left, positiveYUpBottom, width, height);
      this._renderer.setViewport(left, positiveYUpBottom, width, height);
    }

    {
      this._secondView.style.height = `${
        this._secondView.clientWidth / aspect
      }px`;

      const { left, positiveYUpBottom, width, height } = __setScissorForElement(
        this._renderer.domElement,
        this._secondView
      );

      this._secondCamera = createCamera(
        [120, aspect, 1, 300], // option: [fov, aspect, near, far]
        [-90, 300, 30] // position: [x, y, z]
      );

      this._renderer.setScissor(left, positiveYUpBottom, width, height);
      this._renderer.setViewport(left, positiveYUpBottom, width, height);
    }

    const gui = new GUI({
      container: controlView,
      width: 400,
      // title: 'Config',
      injectStyles: false,
    });

    const lightsFolder = gui.addFolder('Lights');
    const mainLightFolder = lightsFolder.addFolder('Main Light');
    // Option
    const mainLightOptionFolder = mainLightFolder.addFolder('Option');
    mainLightOptionFolder
      .addColor(new ColorGUIHelper(mainLight, 'color'), 'value')
      .name('Color')
      .onChange(this.render.bind(this));
    mainLightOptionFolder
      .add(mainLight, 'intensity', 0, 2, 0.01)
      .onChange(this.render.bind(this));
    // Position
    const mainLightPositionFolder = mainLightFolder.addFolder('Position');
    mainLightPositionFolder
      .add(mainLight.position, 'x', -400, 400, 1)
      .onChange(this.render.bind(this));
    mainLightPositionFolder
      .add(mainLight.position, 'y', -400, 400, 1)
      .onChange(this.render.bind(this));
    mainLightPositionFolder
      .add(mainLight.position, 'z', -400, 400, 1)
      .onChange(this.render.bind(this));

    const secondLightFolder = lightsFolder.addFolder('Second Light');
    secondLightFolder
      .addColor(new ColorGUIHelper(secondLight, 'color'), 'value')
      .name('Sky Color')
      .onChange(this.render.bind(this));
    secondLightFolder
      .addColor(new ColorGUIHelper(secondLight, 'groundColor'), 'value')
      .name('Ground Color')
      .onChange(this.render.bind(this));
    secondLightFolder
      .add(secondLight, 'intensity', 0, 2, 0.01)
      .onChange(this.render.bind(this));

    const minMaxGUIHelper = new MinMaxGUIHelper(
      this._mainCamera,
      'near',
      'far',
      0.1
    );

    const cameraFolder = gui.addFolder('Camera');
    // Option
    const cameraOptionFolder = cameraFolder.addFolder('Option');
    cameraOptionFolder
      .add(this._mainCamera, 'fov', 1, 180)
      .onChange(this.render.bind(this));
    cameraOptionFolder
      .add(minMaxGUIHelper, 'min', 0.1, 10, 0.1)
      .name('near')
      .onChange(this.render.bind(this));
    cameraOptionFolder
      .add(minMaxGUIHelper, 'max', 0.1, 600, 0.1)
      .name('far')
      .onChange(this.render.bind(this));
    // Position
    const cameraPositionFolder = cameraFolder.addFolder('Position');
    cameraPositionFolder
      .add(this._mainCamera.position, 'x', -300, 300, 0.1)
      .onChange(this.render.bind(this));
    cameraPositionFolder
      .add(this._mainCamera.position, 'y', -300, 300, 0.1)
      .onChange(this.render.bind(this));
    cameraPositionFolder
      .add(this._mainCamera.position, 'z', -300, 300, 0.1)
      .onChange(this.render.bind(this));

    const mainControls = createControls(this._mainCamera, mainView);
    mainControls.addEventListener('change', this.render.bind(this));

    const secondControls = createControls(this._secondCamera, secondView);
    secondControls.addEventListener('change', this.render.bind(this));

    // const _node = new Node();
    // _node.addEventListener('load-ok', () => {
    //   console.log('---- load-ok');
    //   this.render();
    // });

    const resizer = new Resizer(this._renderer);
    resizer.addEventListener('window-resize', this.render.bind(this));

    this._lightHelper = new DirectionalLightHelper(mainLight);
    this._cameraHelper = new CameraHelper(this._mainCamera);

    this._scene.add(
      mainLight,
      secondLight,
      this._lightHelper,
      this._cameraHelper
    );
  }

  public async init() {
    const building = await loadBuilding();
    this._scene.add(building);
    this.render();
  }

  public render() {
    this._renderer.setScissorTest(true);

    let aspect = 2;

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

      // this._scene!.background.set(0x000040);

      this._renderer.render(this._scene, this._secondCamera);
    }

    this._lightHelper.update();
    this._cameraHelper.update();
  }

  // start() {
  //   this._loop.start();
  // }

  // stop() {
  //   this._loop.stop();
  // }
}
