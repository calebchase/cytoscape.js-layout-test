let options = {
  eventOffset: 150,
};

function colorCode(cy) {
  cy.style().selector('node[type = "event"]').style('background-color', 'darkred').update();
  cy.style().selector('node[type = "person"]').style('background-color', 'darkgreen').update();
  cy.style().selector('node[type = "identifier"]').style('background-color', 'darkblue').update();
}

function resetData(cy) {
  let nodes = cy.elements('node[_used = "true"]');
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].data('_used', 'false');
  }
}

function setEdgesTaxi(edge) {
  edge.style({
    'curve-style': 'taxi',
    'taxi-direction': 'upward',
    'taxi-turn': '-20',
  });
}

function hasOneParent(node) {
  return node.connectedEdges().length == 1;
}

function getOrderedPersons(cy) {
  let persons = cy.elements('node[type = "person"]');
  let insert = false;
  let orderedPersons = [];

  for (let i = 0; i < persons.length; i++) {
    let edgeCount = persons[i].connectedEdges().connectedNodes('node[type = "event"]').length;
    insert = false;

    let length = orderedPersons.length;
    for (let j = 0; j < length; j++) {
      if (edgeCount > orderedPersons[j].edgeCount) {
        orderedPersons.splice(j, 0, { id: persons[i].id(), edgeCount: edgeCount });
        insert = true;
        break;
      }
    }
    if (!insert) {
      orderedPersons.push({ id: persons[i].id(), edgeCount: edgeCount });
    }
  }
  return orderedPersons;
}

function getEventsFromPerson(cy, personId) {
  let person = cy.$id(personId);
  let events = {
    unique: [],
    shared: [],
  };
  let children = person.connectedEdges().connectedNodes(`node[type = "event"][_used != 'true']`);

  for (let i = 0; i < children.length; i++) {
    if (hasOneParent(children[i])) {
      events.unique.push(children[i]);
      setEdgesTaxi(children[i].connectedEdges());
    } else {
      events.shared.push(children[i]);
    }
  }
  return events;
}

function getIdentifiersFromPerson(cy, personId) {
  let person = cy.$id(personId);
  let identifiers = {
    unique: [],
    shared: [],
  };
  let children = person.connectedEdges().connectedNodes(`node[type = "identifier"][_used != 'true']`);

  for (let i = 0; i < children.length; i++) {
    if (hasOneParent(children[i])) {
      identifiers.unique.push(children[i]);
      setEdgesTaxi(children[i].connectedEdges());
    } else {
      identifiers.shared.push(children[i]);
    }
  }
  return identifiers;
}

function setEvents(cy, events, options, start) {
  let eventsDim = Math.ceil(Math.sqrt(events.length));
  let offsetMult = 1;
  let xMax = 0;
  let xMult = 0;

  for (let i = 0; i < events.length; i++) {
    events[i].position({
      x: start.x + options.eventOffset * xMult++,
      y: start.y + options.eventOffset * offsetMult,
    });

    if ((i + 1) % eventsDim == 0) {
      offsetMult++;
      xMult = 0;
    }

    events[i].data('_used', 'true');
    xMax = Math.max(xMax, events[i].position('x'));
  }
  return xMax;
}

function setIdentifiers(cy, identifiers, options, start) {
  for (let i = 0; i < identifiers.length; i++) {
    identifiers[i].position({
      x: start.x,
      y: -(options.eventOffset * i) - 300,
    });
    identifiers[i].data('_used', 'true');
  }
}

export default function layoutB(cy) {
  let persons = getOrderedPersons(cy);
  let events, identifiers, parent;
  colorCode(cy);
  resetData(cy);
  let prevMax = 0;

  for (let i = 0; i < persons.length; i++) {
    parent = cy.$id(persons[i].id);
    events = getEventsFromPerson(cy, persons[i].id);
    identifiers = getIdentifiersFromPerson(cy, persons[i].id);

    //getEdgesToOnlyChild(parent);

    prevMax = 150 + setEvents(cy, identifiers.unique, options, { x: prevMax, y: 0 });
    parent.position({ x: prevMax, y: 0 });

    setIdentifiers(cy, identifiers.shared.concat(events.shared), options, { x: prevMax, y: 0 });

    prevMax = 200 + setEvents(cy, events.unique, options, { x: prevMax, y: 0 });
  }
}
