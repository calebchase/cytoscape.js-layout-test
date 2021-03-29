import cytoscape from 'cytoscape';
import nodeText from './testData0.txt';

import { register as htmlnode } from 'cytoscape-html-node';
import { register as layoutB } from './index.js';

//import { runLayoutB } from './runLayoutB.js';

var nodeHtmlLabel = require('cytoscape-node-html-label');

// register extensions

cytoscape.use(htmlnode);
nodeHtmlLabel(cytoscape);
cytoscape.use(layoutB);
//layoutB(cytoscape);
// //cytoscape.layoutB();

// console.log(layoutB);

//nodeHtmlLabel(cytoscape);

// cytoscape.use(euler);
// cytoscape.use(fcose);
// cytoscape.use(avsdf);

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
          width: 50,
          height: 50,
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

  document.getElementById('layout').onclick = () => {
    console.log('Running layoutB');

    let avg = 0;
    console.log(cy);
    cy.add(JSON.parse(nodeText));
    console.log(cy);

    cy.layoutB();
  };

  //const htmlnode = cy.htmlnode();
});
