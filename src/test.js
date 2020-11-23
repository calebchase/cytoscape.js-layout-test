console.log('Hello, World!');

import cytoscape from 'cytoscape';
import nodeText from './node.txt';
import nodeOffset from './nodeOffset';

document.addEventListener('DOMContentLoaded', function () {
  var cy = (window.cy = cytoscape({
    container: document.getElementById('cy'),
    autounselectify: 'true',
    style: [
      {
        selector: 'node',
        css: {
          content: ' ',
        },
        style: {
          content: '',
          'background-color': 'lightgrey',
          shape: 'round-rectangle',
          width: 100,
          height: 100,
        },
      },
      {
        selector: 'edge',
        style: {
          'curve-style': 'bezier',
          'target-arrow-shape': 'triangle',
        },
      },
    ],
    elements: {
      nodes: [],
      // edges: [{ data: { source: 'a', target: 'b' } }],
    },
    layout: {
      name: 'grid',
      spacingFactor: 0.5,
    },
  }));
  cy.add(JSON.parse(nodeText));

  nodeOffset(cy.elements('node[type = "events"]'), { x: 100, y: 100 }, 150);
  nodeOffset(cy.elements('node[type = "people"]'), { x: 100, y: 300 }, 150);
  nodeOffset(cy.elements('node[type = "identifiers"]'), { x: 100, y: 500 }, 150);
});
