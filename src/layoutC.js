function colorCode(cy) {
  cy.style().selector('edge[type = "event"]').style('line-color', 'darkred').update();
  cy.style().selector('node[type = "person"]').style('background-color', 'darkgreen').update();
  cy.style().selector('edge[type = "identifier"]').style('line-color', 'darkblue').update();
}

export default function layoutC(cy) {
  colorCode(cy);

  cy.edges('type[event], type[identifier]').style({
    'curve-style': 'bezier',
    'control-point-step-size': 10,
  });

  cy.layout({
    name: 'avsdf',
    nodeSeparation: 200,
  }).run();
}
