import { html, TemplateResult } from 'lit';
import '../src/helpers/demo-helper.js';
import { Tree } from '../src/index.js';

export default {
  title: 'ThreeWorld',
  component: 'three-world',
  argTypes: {
    glb: { control: 'string' },
    tree: { control: 'object' },
  },
};

interface Story<T> {
  (args: T): TemplateResult;
  args?: Partial<T>;
  argTypes?: Record<string, unknown>;
}

interface ArgTypes {
  glb: string;
  tree: Tree[];
}

const Template: Story<ArgTypes> = () => html`
  <style>
    html,
    body,
    #root,
    #root-inner {
      margin: 0;
      height: 100%;
    }
  </style>
  <demo-helper
    glb="https://cbosv3-sandbox.oss-cn-hongkong.aliyuncs.com/test-glb/building.glb?v=1"
  ></demo-helper>
`;

export const Regular = Template.bind({});
