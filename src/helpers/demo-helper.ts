import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Tree } from '../world/type.js';

import '../three-world.js';

@customElement('demo-helper')
export class DemoHelper extends LitElement {
  @state()
  _tree: Tree[] = [
    {
      id: '1',
      name: 'root',
      children: [
        {
          id: '2',
          name: 'A栋',
          children: [
            {
              id: '3',
              name: '1楼',
              children: [
                {
                  id: '4',
                  name: '101房',
                  children: [
                    {
                      id: '5',
                      name: 'D001',
                      isLeaf: true,
                    },
                  ],
                },
                {
                  id: '6',
                  name: '102房',
                  children: [
                    {
                      id: '7',
                      name: 'D002',
                      isLeaf: true,
                    },
                  ],
                },
              ],
            },
            {
              id: '8',
              name: '2楼',
              children: [
                {
                  id: '9',
                  name: '201房',
                  children: [
                    {
                      id: '10',
                      name: 'D003',
                      isLeaf: true,
                    },
                  ],
                },
                {
                  id: '11',
                  name: '202房',
                  children: [
                    {
                      id: '12',
                      name: 'D004',
                      isLeaf: true,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: '13',
          name: 'B栋',
          children: [
            {
              id: '14',
              name: '1楼',
              children: [
                {
                  id: '15',
                  name: '101房',
                  children: [
                    {
                      id: '16',
                      name: 'D005',
                      isLeaf: true,
                    },
                  ],
                },
                {
                  id: '17',
                  name: '102房',
                  children: [
                    {
                      id: '18',
                      name: 'D006',
                      isLeaf: true,
                    },
                  ],
                },
              ],
            },
            {
              id: '19',
              name: '2楼',
              children: [
                {
                  id: '20',
                  name: '201房',
                  children: [
                    {
                      id: '21',
                      name: 'D007',
                      isLeaf: true,
                    },
                  ],
                },
                {
                  id: '22',
                  name: '202房',
                  children: [
                    {
                      id: '23',
                      name: 'D008',
                      isLeaf: true,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  render() {
    return html` <three-world .tree=${this._tree}></three-world> `;
  }
}
