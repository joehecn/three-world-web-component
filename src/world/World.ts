import * as THREE from 'three';

import { Group } from 'three';
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
  ArrowHelper,
  BoxHelper,
  PickHelper,
} from './helpers/index.js';

import {
  createRenderer,
  createControls,
  getUniqueResizer,
} from './systems/index.js';

import type { ToolData, AxesConfig, IconConfig, Point, View } from './type.js';
import { getUniqueGui, Gui } from './guis/index.js';

import { emitter } from './emitter.js';

const _imageCache = new Map();

function _loadSpritePromise(base: string, imageName: string) {
  if (_imageCache.has(imageName)) {
    return Promise.resolve(_imageCache.get(imageName));
  }

  return new Promise(resolve => {
    const loader = new THREE.TextureLoader();
    const path = `${base}${imageName}`;
    loader.load(path, texture => {
      _imageCache.set(imageName, texture);
      resolve(texture);
    });
  });
}

function __setScissorForElement(
  canvas: HTMLCanvasElement,
  elem: HTMLDivElement,
  view: View
) {
  const canvasRect = canvas.getBoundingClientRect();

  if (view !== 'config') {
    return {
      left: canvasRect.left,
      positiveYUpBottom: canvasRect.top,
      width: canvasRect.width,
      height: canvasRect.height,
    };
  }

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
  elem: HTMLDivElement,
  view: View
) {
  const { left, positiveYUpBottom, width, height } = __setScissorForElement(
    canvas,
    elem,
    view
  );

  const x = e.clientX - left;
  const y = e.clientY - positiveYUpBottom;

  if (x < 0 || y < 0 || x > width || y > height) return null;
  return { x, y, width, height };
}

export class World {
  private _view: View;

  private _scene: THREE.Scene;

  private _building!: THREE.Group;

  private _assets: THREE.Group;

  private _points: Point[];

  private _mainCamera: THREE.PerspectiveCamera;

  private _secondCamera: THREE.PerspectiveCamera;

  private _renderer: THREE.WebGLRenderer;

  private _mainView: HTMLDivElement;

  private _secondView: HTMLDivElement;

  private _lightHelper: THREE.DirectionalLightHelper;

  private _cameraHelper: THREE.CameraHelper;

  // 用于简单模拟3个坐标轴的对象.
  // 红色代表 X 轴. 绿色代表 Y 轴. 蓝色代表 Z 轴.
  private _axesHelper: THREE.AxesHelper;

  // 用于模拟平面 Plane 的辅助对象.
  private _planeHelper: THREE.PlaneHelper;

  // 坐标格辅助对象. 坐标格实际上是2维线数组.
  private _gridHelper: THREE.GridHelper;

  // 用于模拟方向的3维箭头对象.
  private _arrowHelper: THREE.ArrowHelper;

  // 用于图形化地展示对象世界轴心对齐的包围盒的辅助对象。
  private _boxHelper: THREE.BoxHelper | null = null;

  private _pickHelper: PickHelper = new PickHelper();

  private _gui: Gui | null = null;

  constructor(
    view: View,
    axes: AxesConfig,
    icon: IconConfig,
    points: Point[],
    canvas: HTMLCanvasElement,
    mainView: HTMLDivElement,
    secondView: HTMLDivElement,
    controlView: HTMLDivElement
  ) {
    this._view = view;
    this._assets = new Group();
    this._points = points;

    this._mainView = mainView;
    this._secondView = secondView;

    this._renderer = createRenderer(canvas);
    this._scene = createScene();

    const { mainLight, secondLight } = createLights();

    const { width, height } = __setScissorForElement(
      this._renderer.domElement,
      this._mainView,
      this._view
    );

    const aspect = width / height;

    this._mainCamera = createCamera(
      [45, aspect, 2, 10], // option: [fov, aspect, near, far]
      [4, 4, 4]
    );

    this._secondCamera = createCamera(
      [120, aspect, 2, 30], // option: [fov, aspect, near, far]
      [6, 6, 6] // position: [x, y, z]
    );

    const mainControls = createControls(this._mainCamera, mainView);
    mainControls.addEventListener('change', this.render.bind(this));

    if (this._view === 'config') {
      this._gui = getUniqueGui(
        controlView,
        mainLight,
        secondLight,
        this._mainCamera
      );
      this._gui.addEventListener('gui-change', this.render.bind(this));

      const secondControls = createControls(this._secondCamera, secondView);
      secondControls.addEventListener('change', this.render.bind(this));
    }

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
    this._axesHelper = new AxesHelper(axes.size);
    this._axesHelper.visible = axes.visible;

    this._planeHelper = new PlaneHelper(new THREE.Plane());
    this._planeHelper.visible = false;

    this._gridHelper = new GridHelper(4, 4);
    this._gridHelper.matrix.makeRotationX(Math.PI / 2);
    this._gridHelper.matrixAutoUpdate = false;
    this._planeHelper.add(this._gridHelper);

    this._arrowHelper = new ArrowHelper(
      new THREE.Vector3(),
      new THREE.Vector3(),
      icon.scale
    );
    this._arrowHelper.visible = false;

    this._scene.add(
      mainLight,
      secondLight,
      this._lightHelper,
      this._cameraHelper,
      this._axesHelper,
      this._planeHelper,
      this._arrowHelper,
      this._assets
    );
  }

  private __setPick = (e: MouseEvent) => {
    const canvas = this._renderer.domElement;
    const pos = __getCanvasRelativePosition(
      e,
      canvas,
      this._mainView,
      this._view
    );

    if (!pos) return;

    // 归一化 x, y 坐标
    const x = (pos.x / pos.width) * 2 - 1;
    const y = (pos.y / pos.height) * -2 + 1;

    const Vector2 = new THREE.Vector2(x, y);
    const curent = this._pickHelper.pick(
      Vector2,
      this._building.children,
      this._mainCamera
    );

    if (!curent) {
      this._planeHelper.visible = false;
      this._arrowHelper.visible = false;
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

      const n = new THREE.Vector3();
      n.copy(face?.normal!);
      n.transformDirection(matrixWorld);
      this._arrowHelper.setDirection(n);
      this._arrowHelper.position.copy(point);
      this._arrowHelper.visible = true;
    }

    this.render();
  };

  private __genarateSprite = async (
    base: string,
    point: Point,
    spriteScale: number
  ) => {
    const { icon, _normal, _matrixWorld, _point, userData } = point;

    const spriteMap = (await _loadSpritePromise(base, icon)) as THREE.Texture;
    const spriteMaterial = new THREE.SpriteMaterial({ map: spriteMap });
    const sprite = new THREE.Sprite(spriteMaterial);

    const n = new THREE.Vector3().fromArray(_normal);
    const m = new THREE.Matrix4().fromArray(_matrixWorld);
    n.transformDirection(m);

    const p = new THREE.Vector3().fromArray(_point);
    const local = this._assets.worldToLocal(p);
    sprite.position.copy(local);
    sprite.position.addScaledVector(n, spriteScale);
    sprite.scale.set(spriteScale, spriteScale, 1);

    if (userData) {
      sprite.userData = userData;
    }

    return sprite;
  };

  private __addObject = async (e: MouseEvent) => {
    const canvas = this._renderer.domElement;
    const pos = __getCanvasRelativePosition(
      e,
      canvas,
      this._mainView,
      this._view
    );

    if (!pos) return;

    // 归一化 x, y 坐标
    const x = (pos.x / pos.width) * 2 - 1;
    const y = (pos.y / pos.height) * -2 + 1;

    const Vector2 = new THREE.Vector2(x, y);
    const curent = this._pickHelper.pick(
      Vector2,
      this._building.children,
      this._mainCamera
    );
    if (!curent) return;

    const { face, object, point } = curent;
    const { normal } = face!;
    const { matrixWorld } = object;

    const _normal = normal.toArray();
    const _matrixWorld = matrixWorld.toArray();
    const _point = point.toArray();

    emitter.emit('on-point-create', {
      icon: 'circular.svg',
      _normal,
      _matrixWorld,
      _point,
    });
  };

  private __selectAsset = (e: MouseEvent) => {
    const canvas = this._renderer.domElement;
    const pos = __getCanvasRelativePosition(
      e,
      canvas,
      this._mainView,
      this._view
    );

    if (!pos) return;

    // 归一化 x, y 坐标
    const x = (pos.x / pos.width) * 2 - 1;
    const y = (pos.y / pos.height) * -2 + 1;

    const Vector2 = new THREE.Vector2(x, y);
    const curent = this._pickHelper.pick(
      Vector2,
      this._assets.children,
      this._mainCamera
    );

    if (!curent) {
      if (this._boxHelper) {
        this._boxHelper.visible = false;
        this.render();
        this._gui?.setCurrentGuiKey('config');
      }

      emitter.emit('on-point-selected', {});
      return;
    }

    const { object } = curent;

    if (!this._boxHelper) {
      this._boxHelper = new BoxHelper(object, 0xffff00);
      this._scene.add(this._boxHelper);
    } else {
      this._boxHelper.setFromObject(object);
      this._boxHelper.visible = true;
    }

    this.render();

    // 通知
    emitter.emit('on-point-selected', {
      // uuid: object.uuid,
      userData: object.userData,
    });

    this._gui?.setCurrentGuiKey('asset');
    this._gui?.initAssetGUI(object);
  };

  private async __initAssets(base: string, scale: number) {
    const _fun = async (point: Point) => {
      const sprite = await this.__genarateSprite(base, point, scale);
      this._assets.add(sprite);
    };

    const _promises = this._points.map(_fun);

    await Promise.all(_promises);
  }

  private __elseRender() {
    const { left, positiveYUpBottom, width, height } = __setScissorForElement(
      this._renderer.domElement,
      this._mainView,
      this._view
    );

    const aspect = width / height;

    this._renderer.setScissor(left, positiveYUpBottom, width, height);
    this._renderer.setViewport(left, positiveYUpBottom, width, height);

    this._mainCamera.aspect = aspect;
    this._mainCamera.updateProjectionMatrix();

    this._lightHelper.visible = false;
    this._cameraHelper.visible = false;

    this._renderer.render(this._scene, this._mainCamera);

    this._lightHelper.update();
    this._cameraHelper.update();
  }

  public async addPoint(base: string, point: Point, scale: number) {
    const sprite = await this.__genarateSprite(base, point, scale);
    this._assets.add(sprite);
    this.render();
  }

  public removePoint(point: Point) {
    const { _id } = point.userData!;
    const { children } = this._assets;
    const index = children.findIndex((it: any) => it.userData!._id === _id);
    if (index > -1) {
      children.splice(index, 1);
      this.render();
    }
  }

  public async init(
    base: string,
    scale: number,
    glb: string,
    background: string
  ) {
    this._scene.background = new THREE.Color(background);

    const building = await loadBuilding(`${base}${glb}`);
    // console.log(building); // Group
    this._building = building;
    this._scene.add(building);

    await this.__initAssets(base, scale);

    this.render();
  }

  public toolAction(toolData: ToolData) {
    const { group, actived } = toolData;

    if (group !== 'operate') return;

    if (actived === 'add') {
      // remove listener
      window.removeEventListener('click', this.__selectAsset);
      // add listener
      window.addEventListener('mousemove', this.__setPick);
      window.addEventListener('dblclick', this.__addObject);

      this._planeHelper.visible = true;
      this._arrowHelper.visible = true;
      this.render();
      return;
    }

    if (actived === 'move') {
      // remove listener
      window.removeEventListener('mousemove', this.__setPick);
      window.removeEventListener('dblclick', this.__addObject);
      // add listener
      window.addEventListener('click', this.__selectAsset);

      this._planeHelper.visible = false;
      this._arrowHelper.visible = false;
      this.render();
    }
  }

  public dispose() {
    this._renderer.dispose();
    // this._gui?.dispose();
    this._axesHelper.dispose();
    this._cameraHelper.dispose();
    this._lightHelper.dispose();
    this._building.traverse((obj: any) => {
      if (obj.isMesh) {
        obj.geometry.dispose();
        obj.material.dispose();
      }
    });
    this._scene.remove(this._building);
    this._building = null!;
    // this._scene.dispose();

    window.removeEventListener('mousemove', this.__setPick);
    window.removeEventListener('dblclick', this.__addObject);
    window.removeEventListener('click', this.__selectAsset);
  }

  protected render() {
    if (this._view !== 'config') {
      this.__elseRender();
      return;
    }

    // 启用剪刀测试
    this._renderer.setScissorTest(true);

    let aspect: number;

    {
      const { left, positiveYUpBottom, width, height } = __setScissorForElement(
        this._renderer.domElement,
        this._mainView,
        this._view
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
        this._secondView,
        this._view
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
