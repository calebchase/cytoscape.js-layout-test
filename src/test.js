import cytoscape from 'cytoscape';
import nodeText from './testData0.txt';

import { register as htmlnode } from 'cytoscape-html-node';
import { register as trilayer } from './index.js';

var nodeHtmlLabel = require('cytoscape-node-html-label');

cytoscape.use(htmlnode);
nodeHtmlLabel(cytoscape);
cytoscape.use(trilayer);

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

    cy.add(JSON.parse(nodeText));
    let options = {
      horizontalNodeOffset: 150,
      verticalNodeOffset: 150,
      parentToChildSpacing: 150,
      horizontalSharedOffset: 75,
      parentQuery: 'node[type = "person"]',
      childAQuery: 'node[type = "identifier"]',
      childBQuery: 'node[type = "event"]',
    };
    cy.trilayer(options);
  };
});
