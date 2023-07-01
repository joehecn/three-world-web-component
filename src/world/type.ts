export type ToolData = {
  group: string;
  actived: string;
  btns: {
    action: string;
  }[];
};

export type Tree = {
  id: string;
  name: string;
  children?: Tree[];
  isLeaf?: boolean;
};
