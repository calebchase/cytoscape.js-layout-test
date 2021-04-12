import cytoscape from 'cytoscape';
import exampleData from './testData0.txt';

// import { register as trilayer } from '../../dist/main.bundle.js';
// Or use the following import in your own project:
// import { register as trilayer } from 'cytoscape-trilayer';
import { register as trilayer } from '../../src/index.js';

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
          'line-color': 'grey',
          'target-arrow-color': 'grey',
          'target-arrow-shape': 'triangle',
        },
      },
    ],
  }));

  cy.on('tap', 'node', function (evt) {
    if (evt.target.data('layEdgeOn') == true) {
      evt.target.connectedEdges().style({
        'line-color': 'grey',
        'target-arrow-color': 'grey',
        'z-index': 0,
        width: '3px',
      });
      evt.target.data('layEdgeOn', false);
    } else {
      evt.target.connectedEdges().style({
        'line-color': 'red',
        'target-arrow-color': 'red',
        'z-index': 1,
        width: '5x',
      });
      evt.target.data('layEdgeOn', true);
    }
  });

  cy.add(JSON.parse(exampleData));

  cy.style().selector('node[type = "event"]').style('background-color', 'darkred').update();
  cy.style().selector('node[type = "person"]').style('background-color', 'darkgreen').update();
  cy.style().selector('node[type = "identifier"]').style('background-color', 'darkblue').update();

  let options = {
    name: 'trilayer',
    horizontalNodeOffset: 150,
    verticalNodeOffset: 150,
    parentToChildSpacing: 150,
    horizontalSharedOffset: 75,
    parentQuery: 'node[type = "person"]',
    childAQuery: 'node[type = "identifier"]',
    childBQuery: 'node[type = "event"]',
  };

  console.log('Running example layout.');

  cy.layout(options).run();
  cy.fit(10);
});
