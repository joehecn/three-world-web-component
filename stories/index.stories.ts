import { html, TemplateResult } from 'lit';
import '../src/helpers/demo-helper.js';

export default {
  title: 'ThreeWorld',
  component: 'three-world',
  argTypes: {
    glb: { control: 'string' },
  },
};

interface Story<T> {
  (args: T): TemplateResult;
  args?: Partial<T>;
  argTypes?: Record<string, unknown>;
}

interface ArgTypes {
  glb: string;
}

// base: 'https://cbosv3-sandbox.oss-cn-hongkong.aliyuncs.com/test-glb/'
// const glb = 'building.glb?v=1';
// const glb = 'room.glb?v=1';

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
  <demo-helper></demo-helper>
`;

export const Regular = Template.bind({});
