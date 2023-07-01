import { html, TemplateResult } from 'lit';
import '../src/helpers/demo-helper.js';
import { Tree } from '../src/index.js';

export default {
  title: 'ThreeWorld',
  component: 'three-world',
  argTypes: {
    tree: { control: 'object' },
  },
};

interface Story<T> {
  (args: T): TemplateResult;
  args?: Partial<T>;
  argTypes?: Record<string, unknown>;
}

interface ArgTypes {
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
  <demo-helper></demo-helper>
`;

export const Regular = Template.bind({});
