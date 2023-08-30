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

import type {
  ToolData,
  AxesConfig,
  IconConfig,
  Point,
  View,
  ModelConfig,
} from './type.js';
import { getUniqueGui, Gui } from './guis/index.js';

import { emitter } from './emitter.js';

// const _imageCache = new Map();

function _loadSpritePromise(base: string, imageName: string) {
  // if (_imageCache.has(imageName)) {
  //   return Promise.resolve(_imageCache.get(imageName));
  // }

  return new Promise(resolve => {
    const loader = new THREE.TextureLoader();
    const path = `${base}${imageName}`;
    loader.load(path, texture => {
      // _imageCache.set(imageName, texture);
      resolve(texture);
    });
  });
}

function __setScissorForElement2(
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
  // const positiveYUpBottom = canvasRect.height - bottom;

  // 返回aspect
  return {
    left: canvasRect.left,
    positiveYUpBottom: canvasRect.top,
    width,
    height,
  };
}

function __setScissorForElement(
  canvas: HTMLCanvasElement,
  elem: HTMLDivElement,
  view: View
) {
  const canvasRect = canvas.getBoundingClientRect();

  if (view === 'read') {
    return {
      left: 0,
      positiveYUpBottom: 0,
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

/**
 * 获取相对位置
 * @param e
 * @param canvas
 * @param elem
 * @returns
 */
function __getCanvasRelativePosition(
  e: MouseEvent,
  canvas: HTMLCanvasElement,
  elem: HTMLDivElement
) {
  const { left, positiveYUpBottom, width, height } = __setScissorForElement2(
    canvas,
    elem
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

  // 主光源
  private _mainLight: THREE.DirectionalLight;

  // 副光源
  private _secondLight: THREE.HemisphereLight;

  // 模型配置
  // private _modelConfig!: ModelConfig;

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

  private ON_POINT_CREATE!: symbol;

  private ON_POINT_SELECTED!: symbol;

  private iconScale = 1;

  // 当前点位信息
  private currentPointData: any;

  constructor(
    view: View,
    axes: AxesConfig,
    icon: IconConfig,
    points: Point[],
    modelConfig: ModelConfig,
    canvas: HTMLCanvasElement,
    mainView: HTMLDivElement,
    secondView: HTMLDivElement,
    controlView: HTMLDivElement,
    ON_POINT_CREATE: symbol,
    ON_POINT_SELECTED: symbol
  ) {
    this.ON_POINT_CREATE = ON_POINT_CREATE;
    this.ON_POINT_SELECTED = ON_POINT_SELECTED;

    this._view = view;
    this._assets = new Group();
    this._points = points;
    this.iconScale = icon.scale;
    // this._modelConfig = modelConfig;

    // 获取主光源，副光源，主相机，副相机的配置
    const {
      mainLightConfig,
      secondLightConfig,
      mainCameraConfig,
      secondCameraConfig,
    } = modelConfig;

    this._mainView = mainView;
    this._secondView = secondView;

    this._renderer = createRenderer(canvas);
    this._scene = createScene();

    const { mainLight, secondLight } = createLights();

    this._mainLight = mainLight;
    this._secondLight = secondLight;

    const { width, height } = __setScissorForElement(
      this._renderer.domElement,
      this._mainView,
      this._view
    );

    const aspect = width / height;
    // 主相机
    // [45, aspect, 0.1, 1000], // option: [fov, aspect, near, far] 相机
    // [300, 300, 0], // x,y,z 坐标系的位置
    // [0, 0, 1] // up 代表哪个轴朝上的位置
    this._mainCamera = createCamera(
      [
        mainCameraConfig.fov,
        aspect,
        mainCameraConfig.near,
        mainCameraConfig.far,
      ],
      mainCameraConfig.position,
      mainCameraConfig.up
    );
    // 副相机
    // [200, aspect, 1, 1000], // option: [fov, aspect, near, far]
    // [200, 200, 200] // position: [x, y, z]
    this._secondCamera = createCamera(
      [
        secondCameraConfig.fov,
        aspect,
        secondCameraConfig.near,
        secondCameraConfig.far,
      ],
      secondCameraConfig.position
    );

    // 配置主灯光position
    this._mainLight.position.set(
      mainLightConfig.position.x,
      mainLightConfig.position.y,
      mainLightConfig.position.z
    );
    // 配置主灯光 color
    this._mainLight.color.set(`#${mainLightConfig.color}`);
    // 配置主灯光 intensity
    this._mainLight.intensity = mainLightConfig.intensity;
    // 配置副灯光 color
    this._secondLight.color.set(`#${secondLightConfig.color}`);
    // 配置副灯光 groundColor
    this._secondLight.groundColor.set(`#${secondLightConfig.groundColor}`);
    // 配置副灯光
    this._secondLight.intensity = secondLightConfig.intensity;

    const mainControls = createControls(this._mainCamera, mainView);
    mainControls.addEventListener('change', this.render.bind(this));

    if (this._view !== 'read') {
      this._gui = getUniqueGui(
        controlView,
        this._mainLight,
        this._secondLight,
        this._mainCamera,
        this._secondCamera,
        this._view
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
      // console.log('resizer-render:', clientWidth, clientHeight);
      this._renderer.setSize(clientWidth, clientHeight, false);
      if (needRender) this.render();
    });
    resizer.init();

    // 灯光辅助对象
    this._lightHelper = new DirectionalLightHelper(this._mainLight);
    // 相机辅助对象
    this._cameraHelper = new CameraHelper(this._mainCamera);
    // 用于简单模拟3个坐标轴的对象.
    this._axesHelper = new AxesHelper(axes.size);
    this._axesHelper.visible = axes.visible;
    // 用于模拟平面 Plane 的辅助对象.
    this._planeHelper = new PlaneHelper(new THREE.Plane());
    this._planeHelper.visible = false;

    // 网格辅助对象
    this._gridHelper = new GridHelper(4, 4);
    this._gridHelper.matrix.makeRotationX(Math.PI / 2);
    this._gridHelper.matrixAutoUpdate = false;
    this._planeHelper.add(this._gridHelper);

    // 用于模拟方向的3维箭头对象.
    this._arrowHelper = new ArrowHelper(
      new THREE.Vector3(), // 基于箭头原点的方向. 必须为单位向量.
      new THREE.Vector3(), // 箭头的原点.
      0.1 //  箭头的长度. 默认为 1.
    );
    this._arrowHelper.visible = false;

    this._scene.add(
      this._mainLight,
      this._secondLight,
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
    const pos = __getCanvasRelativePosition(e, canvas, this._mainView);

    if (!pos) return;

    // 归一化 x, y 坐标
    const x = (pos.x / pos.width) * 2 - 1;
    const y = (pos.y / pos.height) * -2 + 1;

    const Vector2 = new THREE.Vector2(x, y);
    // 射线与https://threejs.org/docs/#api/en/core/Raycaster.intersectObject
    const curent = this._pickHelper.pick(
      Vector2,
      this._building.children,
      this._mainCamera
    );

    if (!curent) {
      this._planeHelper.visible = false;
      this._arrowHelper.visible = false;
    } else {
      // face 相交的面 object 相交的面 point 世界坐标的交点  normal - 交点处的内插法向量
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

  // 设置精灵图，添加的时候偏移半个精灵图的位置
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
    // 将所传入的v与s相乘所得的乘积和这个向量相加。向上偏移半个物体的距离
    sprite.position.addScaledVector(n, spriteScale / 2);
    // 将传入的标量s和这个向量的x值、y值以及z值相加。
    // sprite.position.addScalar(spriteScale);
    sprite.scale.set(spriteScale, spriteScale, 1);

    if (userData) {
      sprite.userData = userData;
    }

    return sprite;
  };

  // 设置精灵图，初始化的时候不偏移位置
  private __genarateSpriteInit = async (
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
    // 将所传入的v与s相乘所得的乘积和这个向量相加。向上偏移半个物体的距离
    // sprite.position.addScaledVector(n, spriteScale / 2);
    // 将传入的标量s和这个向量的x值、y值以及z值相加。
    // sprite.position.addScalar(spriteScale);
    sprite.scale.set(spriteScale, spriteScale, 1);

    if (userData) {
      sprite.userData = userData;
    }

    return sprite;
  };

  private __addObject = async (e: MouseEvent) => {
    const canvas = this._renderer.domElement;
    const pos = __getCanvasRelativePosition(e, canvas, this._mainView);

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

    emitter.emit(this.ON_POINT_CREATE, {
      icon: 'circular.svg',
      _normal,
      _matrixWorld,
      _point,
    });
  };

  private __selectAsset = (e: MouseEvent) => {
    const canvas = this._renderer.domElement;
    const pos = __getCanvasRelativePosition(e, canvas, this._mainView);

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
        if (this._view === 'config') {
          this._gui?.setCurrentGuiKey('config');
        }
      }
      // this.currentPointData = null;

      emitter.emit(this.ON_POINT_SELECTED, {});
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
    emitter.emit(this.ON_POINT_SELECTED, {
      // uuid: object.uuid,
      userData: object.userData,
    });

    // this._gui?.setCurrentGuiKey('asset');
    this._gui?.initAssetGUI(object);
    this.currentPointData = curent;
  };

  // 初始化精灵图
  private async __initAssets(base: string, scale: number) {
    const _fun = async (point: Point) => {
      const sprite = await this.__genarateSpriteInit(base, point, scale);
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

      if (this._boxHelper) {
        this._boxHelper.visible = false;
      }

      this.render();
    }
  }

  /**
   * 获取当前点位信息
   */
  public getCurrentPointInfo() {
    if (this.currentPointData) {
      const { object } = this.currentPointData;
      const _point = this._assets.localToWorld(object.position);
      return { object, _point };
    }
    return {
      object: undefined,
      _point: undefined,
    };
  }

  // 获取模型的一些配置信息
  public getConfigData(): ModelConfig {
    return {
      mainLightConfig: {
        color: this._mainLight.color.getHexString(),
        position: {
          x: this._mainLight.position.x,
          y: this._mainLight.position.y,
          z: this._mainLight.position.z,
        },
        intensity: this._mainLight.intensity,
      },
      secondLightConfig: {
        color: this._secondLight.color.getHexString(),
        groundColor: this._secondLight.groundColor.getHexString(),
        intensity: this._secondLight.intensity,
      },
      mainCameraConfig: {
        fov: this._mainCamera.fov,
        near: this._mainCamera.near,
        far: this._mainCamera.far,
        position: [
          this._mainCamera.position.x,
          this._mainCamera.position.y,
          this._mainCamera.position.z,
        ],
        up: [
          this._mainCamera.up.x,
          this._mainCamera.up.y,
          this._mainCamera.up.z,
        ],
      },
      secondCameraConfig: {
        fov: this._secondCamera.fov,
        near: this._secondCamera.near,
        far: this._secondCamera.far,
        position: [
          this._secondCamera.position.x,
          this._secondCamera.position.y,
          this._secondCamera.position.z,
        ],
      },
    };
  }

  public async init(
    base: string,
    scale: number,
    glb: string,
    background: string
  ) {
    this._scene.background = new THREE.Color(background);

    const building = await loadBuilding(`${base}${glb}`);
    const box = new THREE.Box3().setFromObject(building);
    const center = box.getCenter(new THREE.Vector3(0, 0, 0));

    building.position.set(-center.x, -center.y, -center.z);

    this._building = building;
    this._scene.add(building);

    await this.__initAssets(base, scale);

    // console.log('init: render');
    this.render();
  }

  public updateAxes(axes: AxesConfig) {
    // console.log('updateAxes:', axes);
    const { visible } = axes;
    this._axesHelper.visible = visible;
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
    // this._building.traverse((obj: any) => {
    //   if (obj.isMesh) {
    //     obj.geometry.dispose();
    //     obj.material.dispose();
    //   }
    // });
    this._scene.remove(this._building);
    this._building = null!;
    // this._scene.dispose();

    window.removeEventListener('mousemove', this.__setPick);
    window.removeEventListener('dblclick', this.__addObject);
    window.removeEventListener('click', this.__selectAsset);
  }

  protected render() {
    if (this._view === 'read') {
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

      // console.log('secondView:', left, positiveYUpBottom, width, height);

      if (left > 0) {
        this._renderer.setScissor(left, positiveYUpBottom, width, height);
        this._renderer.setViewport(left, positiveYUpBottom, width, height);

        this._secondCamera.aspect = aspect;
        this._secondCamera.updateProjectionMatrix();

        this._lightHelper.visible = true;
        this._cameraHelper.visible = true;

        this._renderer.render(this._scene, this._secondCamera);
      }
    }

    this._lightHelper.update();
    this._cameraHelper.update();
  }
}
