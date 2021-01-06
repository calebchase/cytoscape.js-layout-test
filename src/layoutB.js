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

function hasTwoParents(node) {
  return node.connectedEdges().length == 1;
}

function permutator(inputArr) {
  var results = [];

  function permute(arr, memo) {
    var cur,
      memo = memo || [];

    for (var i = 0; i < arr.length; i++) {
      cur = arr.splice(i, 1);
      if (arr.length === 0) {
        results.push(memo.concat(cur));
      }
      permute(arr.slice(), memo.concat(cur));
      arr.splice(i, 0, cur[0]);
    }

    return results;
  }

  return permute(inputArr);
}

function getNumOfSharedNodes(nodeA, nodeB) {
  let nodeAChildren = nodeA.connectedEdges().connectedNodes();
  let nodeBChildren = nodeB.connectedEdges().connectedNodes();
  return nodeAChildren.filter((value) => nodeBChildren.includes(value)).length;
}

function getPersonsBySharedNodes(cy) {
  let persons = cy.elements('node[type = "person"]');
  let personsIdArr = [];
  let permArr = [];
  let maxList = [];
  let maxCount = -1;
  let curCount;
  let orderedPersons = {};

  for (let i = 0; i < persons.length; i++) {
    personsIdArr.push(persons[i].id());
    orderedPersons[persons[i].id()] = {};

    for (let j = 0; j < persons.length; j++) {
      if (persons[i].id() != persons[j].id()) {
        orderedPersons[persons[i].id()][persons[j].id()] = getNumOfSharedNodes(persons[i], persons[j]);
      }
    }
  }

  permArr = permutator(personsIdArr);
  console.log(orderedPersons);

  for (let i = 0; i < permArr.length; i++) {
    curCount = 0;
    for (let j = 0; j < permArr[i].length - 1; j++) {
      curCount += orderedPersons[permArr[i][j]][permArr[i][j + 1]];
    }
    if (curCount > maxCount) {
      maxCount = curCount;
      maxList = permArr[i];
    }
  }
  console.log(maxList);

  return maxList;
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
      if (children[i].data('_taxiSet') != 'true') {
        setEdgesTaxi(person.edgesWith(`node[id = "${children[i].id()}" ]`));
        console.log(person.edgesWith(`node[id = "${children[i].id()}" ]`));
        children[i].data('_taxiSet', 'true');
      }
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
      if (children[i].data('_taxiSet') != 'true') {
        setEdgesTaxi(person.edgesWith(`node[id = "${children[i].id()}" ]`));
        console.log(person.edgesWith(`node[id = "${children[i].id()}" ]`));
        children[i].data('_taxiSet', 'true');
      }

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

function setSharedIdentifiers(cy, identifiers, options, start) {
  for (let i = 0; i < identifiers.length; i++) {
    identifiers[i].position({
      x: start.x - options.eventOffset,
      y: -(options.eventOffset * i) - 300,
    });
    identifiers[i].data('_used', 'true');
  }
}
function setSharedEvents(cy, identifiers, options, start) {
  for (let i = 0; i < identifiers.length; i++) {
    identifiers[i].position({
      x: start.x + options.eventOffset,
      y: -(options.eventOffset * i) - 300,
    });
    identifiers[i].data('_used', 'true');
  }
}

export default function layoutB(cy) {
  let persons = getPersonsBySharedNodes(cy);
  let events, identifiers, parent;
  // colorCode(cy);
  resetData(cy);
  let prevMax = 0;
  console.log(getPersonsBySharedNodes(cy));

  for (let i = 0; i < persons.length; i++) {
    parent = cy.$id(persons[i]);
    events = getEventsFromPerson(cy, persons[i]);
    identifiers = getIdentifiersFromPerson(cy, persons[i]);

    prevMax = 150 + setEvents(cy, identifiers.unique, options, { x: prevMax, y: 0 });
    parent.position({ x: prevMax, y: 0 });

    setSharedIdentifiers(cy, identifiers.shared, options, { x: prevMax, y: 0 });
    setSharedEvents(cy, events.shared, options, { x: prevMax, y: 0 });

    prevMax = 200 + setEvents(cy, events.unique, options, { x: prevMax, y: 0 });
  }
}
