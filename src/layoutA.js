var options = {
  eventOffSetX: 500,
  personOffSetX: 90,
  personOffsetY: 90,

  identifierOffSetY: 90,
};

function colorCode(cy) {
  cy.style().selector('node[type = "event"]').style('background-color', 'darkred').update();
  cy.style().selector('node[type = "person"]').style('background-color', 'darkgreen').update();
  cy.style().selector('node[type = "identifier"]').style('background-color', 'darkblue').update();
}

function getChildren(parent, target) {
  let children;

  children = parent.successors(`node[type = "${target}"][_used != 'true']`);

  // if (exclude != true) {
  //   children = parent.successors(`node[type = "${target}"]`);
  // } else {
  //   children = children = parent.successors(`node[type = "${target}"][_used != 'true']`);
  //   console.log(children);
  // }

  return children;
}

function resetData(cy) {
  let nodes = cy.elements('node[_used = "true"]');
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].data('_used', 'false');
  }
}

export default function layoutA(cy) {
  let eventNodes = cy.elements('node[type = "event"]');
  let persons, identifiers;
  let leftBounds = 0;

  resetData(cy);
  colorCode(cy);

  for (let i = 0; i < eventNodes.length; i++) {
    eventNodes[i].position({
      x: leftBounds,
      y: 0,
    });

    persons = getChildren(eventNodes[i], 'person');

    for (let j = 0; j < persons.length; j++) {
      persons[j].data('_used', 'true');

      persons[j].position({
        x: eventNodes[i].position('x') + j * options.personOffSetX,
        y: options.personOffsetY,
      });

      identifiers = getChildren(persons[j], 'identifier');

      for (let k = 0; k < identifiers.length; k++) {
        identifiers[k].data('_used', 'true');

        identifiers[k].position({
          x: persons[j].position('x'),
          y: options.identifierOffSetY * k + persons[j].position('y') * 2,
        });
        leftBounds = Math.max(leftBounds, identifiers[k].position('x'));
      }
    }
    leftBounds += 200;
  }
  console.log(eventNodes);
}
