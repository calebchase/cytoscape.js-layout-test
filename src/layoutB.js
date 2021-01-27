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

function setEdgeBez(edge) {
  edge.style({
    'curve-style': 'straight',
  });
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
        //setEdgesTaxi(person.edgesWith(`node[id = "${children[i].id()}" ]`));
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
  let xMax = [0, 0];
  let xMult = 0;

  for (let i = 0; i < events.length; i++) {
    events[i].position({
      x: start.x + options.eventOffset * xMult++,
      y: -(start.y + options.eventOffset * offsetMult),
    });

    if ((i + 1) % eventsDim == 0) {
      offsetMult++;
      xMult = 0;
    }

    events[i].data('_used', 'true');
    xMax[0] = Math.max(xMax[0], events[i].position('x'));
    xMax[1] = Math.min(xMax[1], events[i].position('y'));
  }
  console.log(xMax);
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

function nodeListToArray(nodes) {
  let array = [];
  for (let i = 0; i < nodes.length; i++) {
    array.push(nodes[i].id());
  }
  return array;
}

function findPlacementParentIndex(nodeList, target) {
  for (let i = 0; i < nodeList.length; i++) {
    if (nodeList[i] == target) return i;
  }
  return -1;
}

function findPlacementParent(allParents, childParents) {
  let count = 0;
  for (let i = 0; i < allParents.length; i++) {
    if (childParents.includes(allParents[i])) {
      count++;
    }
    if (Math.ceil(childParents.length / 2) == count) {
      return allParents[i];
    }
  }
  return -1;
}

function getPersonWidthIndexs(node, parents) {
  let childParents = nodeListToArray(
    node.connectedEdges().connectedNodes(`node[type = "person"][id != "${node.id()}"]`)
  );

  let parentIndexArr = [];

  let min = -1,
    max = -1;

  for (let j = 0; j < parents.length; j++) {
    if (childParents.includes(parents[j])) {
      parentIndexArr.push(j);
    }
  }
  return parentIndexArr.sort((a, b) => a - b);
}

function getPersonWidth(node, parents) {
  let childParents = nodeListToArray(
    node.connectedEdges().connectedNodes(`node[type = "person"][id != "${node.id()}"]`)
  );

  let min = -1,
    max = -1;

  for (let j = 0; j < parents.length; j++) {
    if (min == -1 && childParents.includes(parents[j])) {
      min = j;
    } else if (childParents.includes(parents[j])) max = j;
  }
  return max - min;
}

function isConflict(a, b) {
  console.log(a, b);
  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < a.length - 1; j++) {
      if (b[j] < a[i + 1] && a[i + 1] < b[j + 1]) {
        return true;
      } else if (b[j] < a[i] && a[i] < b[j + 1]) {
        return true;
      }
    }
  }
  return false;
}

function increaseLevel(a, b) {
  return a[0] <= b[0] && a[1] >= b[1];
}

function checkLineStyle(nodeLevel, curIndex) {
  let increase = false;
  for (const i in nodeLevel) {
    for (let j = 0; j < nodeLevel[i].length; j++) {
      console.log(increase);
      if (i == curIndex.key && j == curIndex.index) return increase;

      if (
        increase == false &&
        increaseLevel(nodeLevel[curIndex.key][curIndex.index].range, nodeLevel[i][j].range)
      ) {
        console.log(`${nodeLevel[curIndex.key][curIndex.index].range} levels with ${nodeLevel[i][j].range}`);
        increase = true;
      }

      if (isConflict(nodeLevel[curIndex.key][curIndex.index].range, nodeLevel[i][j].range)) {
        console.log(
          `${nodeLevel[curIndex.key][curIndex.index].range} conflicts with ${nodeLevel[i][j].range}`
        );
        setEdgeBez(nodeLevel[curIndex.key][curIndex.index].node.connectedEdges());
        nodeLevel[i][j].range = [-2, -1];
        return false;
      }
    }
  }
  return increase;
}
function setSharedNodes(cy, parents, nodes, yMax) {
  let persons = {
    idList: parents,
    eventMaxY: new Array(parents.length).fill(0),
    identifierMaxY: new Array(parents.length).fill(0),
  };

  let offset;
  let bonusLevel = 0;

  let nodeLevel = {};

  nodes = nodes.sort((a, b) => {
    return getPersonWidth(a, parents) < getPersonWidth(b, parents) ? 1 : -1;
  });

  for (let j = 0; j < nodes.length; j++) {
    if (nodeLevel[getPersonWidth(nodes[j], parents)] == undefined) {
      nodeLevel[getPersonWidth(nodes[j], parents)] = [];
    }
    nodeLevel[getPersonWidth(nodes[j], parents)].push({
      node: nodes[j],
      range: getPersonWidthIndexs(nodes[j], parents).sort((a, b) => a - b),
    });
  }

  for (let f = 0; f < nodes.length; f++) console.log(getPersonWidth(nodes[f], parents));
  let increase = false;
  let increaseLevelNum = 0;
  let count = 0;
  for (const i in nodeLevel) {
    count++;
    for (let j = 0; j < nodeLevel[i].length; j++) {
      console.log(nodeLevel[i][j]);
      increase = checkLineStyle(nodeLevel, { key: i, index: j });
      console.log(increase);

      if (increase && j != 0) increaseLevelNum++;

      let childParents = nodeListToArray(
        nodeLevel[i][j].node
          .connectedEdges()
          .connectedNodes(`node[type = "person"][id != "${nodeLevel[i][j].node.id()}"]`)
      );

      let placementParent = findPlacementParent(persons.idList, childParents);

      console.log(nodeLevel[i][j].node.connectedEdges().style('curve-style'));

      if (nodeLevel[i][j].node.connectedEdges().style('curve-style') != 'straight') {
        nodeLevel[i][j].node.position({
          x: cy.nodes(`node[id = "${placementParent}"]`).position('x') + 150,
          y: (increaseLevelNum + count) * -150 + yMax,
        });
        if (increase) increaseLevelNum++;
        increase = false;
      } else {
        nodeLevel[i][j].node.position({
          x: cy.nodes(`node[id = "${placementParent}"]`).position('x'),
          y: count * 150,
        });
      }
    }
    if (increaseLevelNum > 0) increaseLevelNum--;
  }
}

export default function layoutB(cy) {
  setEdgesTaxi(cy.edges());
  let persons = getPersonsBySharedNodes(cy);
  let events, identifiers, parent;
  colorCode(cy);
  resetData(cy);
  let prevMax = [0, 0];
  let yMax = 0;

  for (let i = 0; i < persons.length; i++) {
    parent = cy.$id(persons[i]);
    events = getEventsFromPerson(cy, persons[i]);
    identifiers = getIdentifiersFromPerson(cy, persons[i]);

    prevMax = setEvents(cy, identifiers.unique, options, { x: prevMax[0], y: 0 });
    prevMax[0] += 150;
    yMax = Math.min(prevMax[1], yMax);

    parent.position({ x: prevMax[0], y: 0 });

    prevMax = setEvents(cy, events.unique, options, { x: prevMax[0], y: 0 });
    prevMax[0] += 150;
    yMax = Math.min(prevMax[1], yMax);
  }
  console.log('boop', yMax);

  setSharedNodes(
    cy,
    persons,
    cy.nodes(`node[type = "event"][_used != "true"], node[type = "identifier"][_used != "true"]`),
    yMax
  );
}
