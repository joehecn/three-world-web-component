export type ToolData = {
  group: string;
  actived: string;
  btns: {
    action: string;
  }[];
};

export type AxesConfig = {
  size: number;
  visible: boolean;
};

export type IconConfig = {
  scale: number;
};

export type Point = {
  icon: string;
  _normal: number[];
  _matrixWorld: number[];
  _point: number[];
  userData?: { [key: string]: any };
};

export type View = 'read' | 'edit' | 'config';

export type ModelConfig = {
  mainLightConfig: {
    color: string;
    position: {
      x: number;
      y: number;
      z: number;
    };
    intensity: number;
  };
  secondLightConfig: {
    color: string;
    groundColor: string;
    intensity: number;
  };
  mainCameraConfig: {
    fov: number;
    near: number;
    far: number;
    position: [number, number, number];
    up: [number, number, number];
  };
  secondCameraConfig: {
    fov: number;
    near: number;
    far: number;
    position: [number, number, number];
  };
};
