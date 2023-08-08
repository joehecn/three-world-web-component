export type ToolData = {
  group: string;
  actived: string;
  btns: {
    action: string;
  }[];
};

export type Axes = {
  size: number;
  visible: boolean;
};

export type Point = {
  icon: string;
  _normal: number[];
  _matrixWorld: number[];
  _point: number[];
  userData?: { [key: string]: any };
};

export type View = 'read' | 'edit' | 'config';
