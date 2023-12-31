# \<three-world-web-component>

```bash
npx gltf-pipeline -i assets/tw/glb/u1.gltf -o assets/tw/glb/u1Draco.gltf -d
npx gltf-pipeline -i assets/tw/glb/u1Draco.gltf -o assets/tw/glb/u1Draco.glb

/Users/hemiao/Downloads/IfcConvert /Users/hemiao/Downloads/ifc/glb/Switchboard_Model_IVE_Room_225.ifc /Users/hemiao/Downloads/ifc/glb/Switchboard_Model_IVE_Room_225.glb
```

## Demo
[storybook](https://joehecn.github.io/three-world-web-component/iframe.html?id=threeworld--regular&args=&viewMode=story)

This webcomponent follows the [open-wc](https://github.com/open-wc/open-wc) recommendation.

## Installation

```bash
npm i three-world
```

## Usage

### 参数
``` js
/**
 * @param {string} glb required 模型地址
 */
```

```html
<script type="module">
  import 'three-world/three-world.js';
</script>

<three-world></three-world>
```

## Linting and formatting

To scan the project for linting and formatting errors, run

```bash
npm run lint
```

To automatically fix linting and formatting errors, run

```bash
npm run format
```

## Testing with Web Test Runner

To execute a single test run:

```bash
npm run test
```

To run the tests in interactive watch mode run:

```bash
npm run test:watch
```

## Demoing with Storybook

To run a local instance of Storybook for your component, run

```bash
npm run storybook
```

To build a production version of Storybook, run

```bash
npm run storybook:build
```


## Tooling configs

For most of the tools, the configuration is in the `package.json` to reduce the amount of files in your project.

If you customize the configuration a lot, you can consider moving them to individual files.

## Local Demo with `web-dev-server`

```bash
npm start
```

To run a local development server that serves the basic demo located in `demo/index.html`
