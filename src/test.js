console.log('Hello, World!');

import cytoscape from 'cytoscape';
import txt from './node.txt';

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
  console.log(JSON.parse(txt));
  cy.add(JSON.parse(txt));
});
