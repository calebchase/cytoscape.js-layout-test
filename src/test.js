console.log('Hello, World!');

import cytoscape from 'cytoscape';
import nodeText from './node.txt';
import fcose from 'cytoscape-fcose';
import euler from 'cytoscape-euler';
import layoutB from './layoutB';
import layoutC from './layoutC';
import avsdf from 'cytoscape-avsdf';

import { register as htmlnode } from 'cytoscape-html-node';
var nodeHtmlLabel = require('cytoscape-node-html-label');

// register extensions
cytoscape.use(htmlnode);
nodeHtmlLabel(cytoscape);

cytoscape.use(euler);
cytoscape.use(fcose);
cytoscape.use(avsdf);

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
  cy.add(JSON.parse(nodeText));

  //nodeOffset(cy.elements('node[type = "event"]'), { x: 100, y: 100 }, 150);
  //nodeOffset(cy.elements('node[type = "person"]'), { x: 100, y: 400 }, 150);
  //nodeOffset(cy.elements('node[type = "identifier"]'), { x: 100, y: 700 }, 150);
  // var layout = cy.layout({
  //   name: 'random',
  //   animate: true,
  //   animationDuration: 1000,
  // });

  // layout.run();

  var f = cy.layout({
    name: 'fcose',
    quality: 'proof',
    idealEdgeLength: 100,
    nodeRepulsion: 1000,
    nodeSeparation: 200,
    initialEnergyOnIncremental: 0.8,
    //numIter: 1000,
    edgeElasticity: 0.15,
  });

  var e = cy.layout({
    name: 'euler',
    springLength: (edge) => 150,
    springCoeff: (edge) => 0.0008,
  });

  document.getElementById('f').onclick = () => {
    f.run();
  };

  document.getElementById('e').onclick = () => {
    e.run();
  };

  document.getElementById('c').onclick = () => {
    layoutC(cy);
  };

  document.getElementById('b').onclick = () => {
    console.log('Running base layout');
    nodeOffset(cy.elements('node[type = "event"]'), { x: 100, y: 100 }, 150);
    nodeOffset(cy.elements('node[type = "person"]'), { x: 100, y: 400 }, 150);
    nodeOffset(cy.elements('node[type = "identifier"]'), { x: 100, y: 700 }, 150);
  };

  document.getElementById('layout').onclick = () => {
    console.log('Running layoutB');
    layoutB(cy);
  };

  const htmlnode = cy.htmlnode();

  // htmlnode.createHtmlNode(cy, {
  //   events: {
  //     query: "[type = 'event']",
  //     //defaultColor: 'lightGrey',
  //     //altColor: 'darkBlue',
  //     template: [
  //       {
  //         zoomRange: [0.001, 100],
  //         template: {
  //           html: `<div id="htmlLabel:#{data.id}">
  //                  <img src="#{data.image}" width="75">
  //                </div>`,
  //           cssClass: 'htmlCard',
  //         },
  //       },
  //     ],
  //   },
  //   persons: {
  //     query: "[type = 'person']",
  //     //defaultColor: 'lightGrey',
  //     //altColor: 'darkBlue',
  //     template: [
  //       {
  //         zoomRange: [0.001, 100],
  //         template: {
  //           html: `<div id="htmlLabel:#{data.id}">
  //                  <img src="#{data.image}" width="75">
  //                </div>`,
  //           cssClass: 'htmlCard',
  //         },
  //       },
  //     ],
  //   },
  //   iden: {
  //     query: "[type = 'identifier']",
  //     //defaultColor: 'lightGrey',
  //     //altColor: 'darkBlue',
  //     template: [
  //       {
  //         zoomRange: [0.001, 100],
  //         template: {
  //           html: `<div id="htmlLabel:#{data.id}">
  //                  <img src="#{data.image}" width="75">
  //                </div>`,
  //           cssClass: 'htmlCard',
  //         },
  //       },
  //     ],
  //   },
  // });
});
