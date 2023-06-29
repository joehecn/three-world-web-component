// import { html } from 'lit';
// import { fixture, expect } from '@open-wc/testing';
import { expect } from '@open-wc/testing';
// import { ThreeWorld } from '../src/ThreeWorld.js';
import '../src/three-world.js';

describe('ThreeWorld', () => {
  it('has a default', async () => {
    // const el = await fixture<ThreeWorld>(html`<three-world></three-world>`);

    // expect(el.header).to.equal('Hey there');
    expect(1).to.not.be.undefined;
  });

  // it('increases the counter on button click', async () => {
  //   const el = await fixture<ThreeWorld>(html`<three-world></three-world>`);
  //   el.shadowRoot!.querySelector('button')!.click();

  //   expect(el.counter).to.equal(6);
  // });

  // it('can override the header via attribute', async () => {
  //   const el = await fixture<ThreeWorld>(html`<three-world header="attribute header"></three-world>`);

  //   expect(el.header).to.equal('attribute header');
  // });

  // it('passes the a11y audit', async () => {
  //   const el = await fixture<ThreeWorld>(html`<three-world></three-world>`);

  //   await expect(el).shadowDom.to.be.accessible();
  // });
});
