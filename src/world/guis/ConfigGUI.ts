import * as THREE from 'three';
import { EventDispatcher } from 'three';
import GUI from 'lil-gui';

import { ColorGUIHelper, MinMaxGUIHelper } from '../helpers/index.js';

export class ConfigGUI extends EventDispatcher {
  private _gui: GUI;

  constructor(
    controlView: HTMLDivElement,
    mainLight: THREE.DirectionalLight,
    secondLight: THREE.HemisphereLight,
    mainCamera: THREE.PerspectiveCamera,
    secondCamera: THREE.PerspectiveCamera
  ) {
    super();

    const gui = new GUI({
      container: controlView,
      width: 360,
      title: 'Config',
      injectStyles: false,
    });
    this._gui = gui;

    const lightsFolder = gui.addFolder('Lights');
    const mainLightFolder = lightsFolder.addFolder('Main Light');
    // Option
    const mainLightOptionFolder = mainLightFolder.addFolder('Option');
    mainLightOptionFolder
      .addColor(new ColorGUIHelper(mainLight, 'color'), 'value')
      .name('Color')
      .onChange(this._dispatch.bind(this));
    mainLightOptionFolder
      .add(mainLight, 'intensity', 0, 2, 0.01)
      .onChange(this._dispatch.bind(this));
    // Position
    const mainLightPositionFolder = mainLightFolder.addFolder('Position');
    mainLightPositionFolder
      .add(mainLight.position, 'x', -300, 300, 1)
      .onChange(this._dispatch.bind(this));
    mainLightPositionFolder
      .add(mainLight.position, 'y', -300, 300, 1)
      .onChange(this._dispatch.bind(this));
    mainLightPositionFolder
      .add(mainLight.position, 'z', -300, 300, 1)
      .onChange(this._dispatch.bind(this));

    const secondLightFolder = lightsFolder.addFolder('Second Light');
    secondLightFolder
      .addColor(new ColorGUIHelper(secondLight, 'color'), 'value')
      .name('Sky Color')
      .onChange(this._dispatch.bind(this));
    secondLightFolder
      .addColor(new ColorGUIHelper(secondLight, 'groundColor'), 'value')
      .name('Ground Color')
      .onChange(this._dispatch.bind(this));
    secondLightFolder
      .add(secondLight, 'intensity', 0, 2, 0.01)
      .onChange(this._dispatch.bind(this));

    const minMaxGUIHelper = new MinMaxGUIHelper(mainCamera, 'near', 'far', 0.1);

    const cameraFolder = gui.addFolder('Camera');

    // Option
    const cameraOptionFolder = cameraFolder.addFolder('Option');
    cameraOptionFolder
      .add(mainCamera, 'fov', 1, 180)
      .onChange(this._dispatch.bind(this));
    cameraOptionFolder
      .add(minMaxGUIHelper, 'min', 0.1, 10, 0.1)
      .name('near')
      .onChange(this._dispatch.bind(this));
    cameraOptionFolder
      .add(minMaxGUIHelper, 'max', 0.1, 1000, 0.1)
      .name('far')
      .onChange(this._dispatch.bind(this));
    // Position
    const cameraPositionFolder = cameraFolder.addFolder('Position');
    cameraPositionFolder
      .add(mainCamera.position, 'x', -300, 300, 0.1)
      .onChange(this._dispatch.bind(this));
    cameraPositionFolder
      .add(mainCamera.position, 'y', -300, 300, 0.1)
      .onChange(this._dispatch.bind(this));
    cameraPositionFolder
      .add(mainCamera.position, 'z', -300, 300, 0.1)
      .onChange(this._dispatch.bind(this));
    // up
    const cameraUpFolder = cameraFolder.addFolder('Up');
    cameraUpFolder
      .add(mainCamera.up, 'x', 0, 1, 1)
      .onChange(this._dispatch.bind(this));
    cameraUpFolder
      .add(mainCamera.up, 'y', 0, 1, 1)
      .onChange(this._dispatch.bind(this));
    cameraUpFolder
      .add(mainCamera.up, 'z', 0, 1, 1)
      .onChange(this._dispatch.bind(this));

    const minMaxGUIHelper2 = new MinMaxGUIHelper(
      secondCamera,
      'near',
      'far',
      0.1
    );
    const secondCameraFolder = gui.addFolder('secondCamera');

    // Option
    const secondCameraOptionFolder = secondCameraFolder.addFolder('Option');
    secondCameraOptionFolder
      .add(secondCamera, 'fov', 1, 180)
      .onChange(this._dispatch.bind(this));
    secondCameraOptionFolder
      .add(minMaxGUIHelper2, 'min', 0.1, 10, 0.1)
      .name('near')
      .onChange(this._dispatch.bind(this));
    secondCameraOptionFolder
      .add(minMaxGUIHelper2, 'max', 0.1, 1000, 0.1)
      .name('far')
      .onChange(this._dispatch.bind(this));
    // Position
    const secondCameraPositionFolder = secondCameraFolder.addFolder('Position');
    secondCameraPositionFolder
      .add(secondCamera.position, 'x', -300, 300, 0.1)
      .onChange(this._dispatch.bind(this));
    secondCameraPositionFolder
      .add(secondCamera.position, 'y', -300, 300, 0.1)
      .onChange(this._dispatch.bind(this));
    secondCameraPositionFolder
      .add(secondCamera.position, 'z', -300, 300, 0.1)
      .onChange(this._dispatch.bind(this));
  }

  private _dispatch() {
    this.dispatchEvent({ type: 'config-gui-change' });
  }

  public show() {
    this._gui.show();
  }

  public hide() {
    this._gui.hide();
  }
}
