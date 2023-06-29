import { html } from 'lit';
import '../src/three-world.js';
export default {
    title: 'ThreeWorld',
    component: 'three-world',
    // argTypes: {
    //   header: { control: 'text' },
    //   counter: { control: 'number' },
    //   textColor: { control: 'color' },
    // },
};
// const Template: Story<ArgTypes> = ({
//   header = 'Hello world',
//   counter = 5,
//   textColor,
//   slot,
// }: ArgTypes) => html`
//   <three-world
//     style="--three-world-text-color: ${textColor || 'black'}"
//     .header=${header}
//     .counter=${counter}
//   >
//     ${slot}
//   </three-world>
// `;
const Template = () => html `
  <style>
    html,
    body,
    #root,
    #root-inner {
      margin: 0;
      height: 100%;
    }
  </style>
  <three-world></three-world>
`;
export const Regular = Template.bind({});
// export const CustomHeader = Template.bind({});
// CustomHeader.args = {
//   header: 'My header',
// };
// export const CustomCounter = Template.bind({});
// CustomCounter.args = {
//   counter: 123456,
// };
// export const SlottedContent = Template.bind({});
// SlottedContent.args = {
//   slot: html`<p>Slotted content</p>`,
// };
// SlottedContent.argTypes = {
//   slot: { table: { disable: true } },
// };
//# sourceMappingURL=index.stories.js.map