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

function enlargePersons() {
  cy.nodes('node[type = "person"]').style({
    width: 70,
    height: 70,
  });
}

function lineDistance(a, b) {
  console.log(b);
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

function getSign(a, b) {
  if (a < b) return -1;
  return 1;
}

function getDir(targetY, baseY) {
  if (baseY < targetY) return -1;
  return 1;
}

function calculateSegDistance(edge, targetPoint, min) {
  let startPoint = edge.source().position();
  let endPoint = edge.target().position();
  let sign = getSign(startPoint.x, endPoint.x);

  targetPoint.x += sign * 300;

  console.log('here', startPoint, endPoint, targetPoint);

  let mainSlope = (startPoint.y - endPoint.y) / (startPoint.x - endPoint.x);
  let intersectSlope = -(1 / mainSlope);
  let mainB = endPoint.y - mainSlope * endPoint.x;

  console.log('here main line', 'slope', mainSlope, 'b', mainB);

  let intersectB = targetPoint.y - intersectSlope * targetPoint.x;

  let intersectX = (intersectB - mainB) / (mainSlope - intersectSlope);
  let intersectY = intersectSlope * intersectX + intersectB;

  console.log('here second  line', 'slope', intersectSlope, 'b', intersectB);

  console.log('hereh', intersectX, intersectY);

  let distance = lineDistance({ x: targetPoint.x, y: targetPoint.y }, { x: intersectX, y: intersectY });
  console.log(
    'here distance',
    { x: targetPoint.x, y: targetPoint.y },
    { x: intersectX, y: intersectY },
    distance
  );
  let weight =
    lineDistance(startPoint, { x: intersectX, y: intersectY }) / lineDistance(startPoint, endPoint);

  console.log('hit');

  sign = -getDir(targetPoint.y, intersectY) * sign;

  edge.style({
    'segment-distances': `${-sign * distance} `,
    'segment-weights': `${weight} `,
  });
}

function setControlPoints(edge) {
  let startPoint = edge.source().position();
  let endPoint = edge.target().position();

  let mainSlope = (startPoint.y - endPoint.y) / (startPoint.x - endPoint.x);
  let intersectSlope = -(1 / mainSlope);
  let mainB = endPoint.y - mainSlope * endPoint.x;
  let intersectB = endPoint.y - intersectSlope * startPoint.x;
  let intersectX = (intersectB - mainB) / (mainSlope - intersectSlope);
  let intersectY = intersectSlope * intersectX + intersectB;

  if (startPoint.x == endPoint.x) {
    edge.style({
      'curve-style': 'straight',
    });
    return;
  }

  let sign = getSign(startPoint.x, endPoint.x);

  let weight =
    lineDistance(startPoint, { x: intersectX, y: intersectY }) / lineDistance(startPoint, endPoint);

  console.log(weight);
  let distance = sign * lineDistance({ x: startPoint.x, y: endPoint.y }, { x: intersectX, y: intersectY });
  let distance2 = lineDistance(startPoint, endPoint);

  console.log(distance, weight);
  let min = Math.min(weight, 1 - weight);
  let max = 1 - min;

  console.log('ree', startPoint, endPoint);
  console.log('ree');
}

function setPoints(sameX) {
  for (const key in sameX) {
    let nodes = sameX[key].nodes;
    let parent = sameX[key].parent;
    let minYval = -Infinity;
    if (nodes.length < 2) continue;
    console.log('jjj looking at key:', key);
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].position('y') > minYval) {
        minYval = nodes[i].position('y');
      }
    }

    if (minYval != -Infinity && nodes.length > 1) {
      console.log('here', '----------');
      for (let i = 0; i < nodes.length; i++) {
        let edges = parent.connectedEdges(`edge[type = "bez"]`);

        for (let k = 0; k < edges.length; k++) {
          if (edges[k].target().id() == nodes[i].id()) {
            calculateSegDistance(edges[k], {
              x: nodes[i].position('x'),
              y: minYval,
            });
            break;
          }
        }
      }
    }
  }
}

function configBezEdges(cy, parents) {
  for (let i = 0; i < parents.length; i++) {
    let targetNodes = cy.$id(parents[i]).connectedEdges(`edge[type = "bez"]`).connectedNodes();
    let currentParent = cy.$id(parents[i]);
    let sameX = {};

    for (let j = 0; j < targetNodes.length; j++) {
      if (sameX[targetNodes[j].position('x')] == undefined) {
        sameX[targetNodes[j].position('x')] = {};
        sameX[targetNodes[j].position('x')].parent = currentParent;
        sameX[targetNodes[j].position('x')].nodes = [];
      }
      if (targetNodes[j].position('x') != currentParent.position('x')) {
        sameX[targetNodes[j].position('x')].nodes.push(targetNodes[j]);
      }
    }
    console.log('jjj', sameX);
    setPoints(sameX);
  }
}

function setEdgeBez(edge) {
  edge.data({
    type: 'bez',
  });
  edge.style({
    'curve-style': 'segments',
    'segment-distances': `0`,
    'edge-distances': 'node-position',
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

function highlightConnectedEdges(selector, color) {
  cy.on('tap', selector, function (evt) {
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
        'line-color': color,
        'target-arrow-color': color,
        'z-index': 1,
        width: '5x',
      });
      evt.target.data('layEdgeOn', true);
    }
  });
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

function convertNodeArrToObj(cy, arr) {
  let obj = {};
  for (let i = 0; i < arr.length; i++) {
    let node = cy.$id(arr[i]);

    obj[arr[i]] = {};

    obj[arr[i]].attached = nodeListToArray(
      node
        .connectedEdges()
        .connectedNodes()
        .connectedEdges()
        .connectedNodes(`node[type = "person"][id != "${node.id()}"]`)
    );

    obj[arr[i]].index = -1;
  }
  return obj;
}

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function getPersonsBySharedNodes(cy) {
  let persons = cy.elements('node[type = "person"]');
  let personsIdArr = [];
  let permArr = [];
  let maxList = [];
  let fastList = [];
  let maxCount = -1;
  let curCount;
  let orderedPersons = {};
  let nodeObj = {};
  let minCount = 1_000_000;

  for (let i = 0; i < persons.length; i++) {
    personsIdArr.push(persons[i].id());
    orderedPersons[persons[i].id()] = {};

    for (let j = 0; j < persons.length; j++) {
      if (persons[i].id() != persons[j].id()) {
        orderedPersons[persons[i].id()][persons[j].id()] = getNumOfSharedNodes(persons[i], persons[j]);
      }
    }
  }
  let maxTempCount;

  for (let k = 0; k < personsIdArr.length; k++) {
    fastList.push(personsIdArr[k]);
    maxTempCount = 0;
    for (let i = 0; i < personsIdArr.length; i++) {
      curCount = 0;
      let maxId;
      let maxIdCount = 0;
      for (let j = 0; j < personsIdArr.length; j++) {
        if (
          fastList[i] != undefined &&
          personsIdArr[i] != undefined &&
          orderedPersons[fastList[i]][personsIdArr[j]] > maxIdCount &&
          !fastList.includes(personsIdArr[j])
        ) {
          maxIdCount = orderedPersons[fastList[i]][personsIdArr[j]];
          maxId = personsIdArr[j];
        }
      }
      fastList.push(maxId);
      maxTempCount += maxIdCount;
    }
    if (maxTempCount > maxCount) {
      maxCount = maxTempCount;
      maxList = fastList;
    }
    fastList = [];
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
      y: start.y + options.eventOffset * offsetMult,
    });

    if ((i + 1) % eventsDim == 0) {
      offsetMult++;
      xMult = 0;
    }

    events[i].data('_used', 'true');
    xMax[0] = Math.max(xMax[0], events[i].position('x'));
    xMax[1] = Math.min(xMax[1], events[i].position('y'));
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

  let min = 1000,
    max = -1;

  for (let j = 0; j < parents.length; j++) {
    if (childParents.includes(parents[j])) {
      min = Math.min(min, j);
      max = Math.max(max, j);
    }
  }
  return (max - min) / childParents.length;
}

function isConflict(a, b) {
  if (a[0] < 0 || b[0] < 0) return false;
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length - 1; j++) {
      if (a[i] > b[j] && a[i] < b[j + 1]) return true;
    }
  }
  return false;
}

function possibleIncreaseLevel(a, b) {
  return a[0] == b[b.length - 1] || a[a.length - 1] == b[0];
}

function increaseLevel(a, b) {
  if (a[0] < 0 && b[0] < 0) return false;
  let increase = false;
  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < b.length - 1; j++) {
      if (a[i] <= b[j] && a[i + 1] >= b[j + 1]) increase = true;
    }
  }
  return increase;
}

function findLevelUp(levels, defLevel) {
  if (levels.length == 0) return defLevel + 1;

  levels.sort((a, b) => a - b);

  for (let i = 0; i < levels.length - 1; i++) {
    if (levels[i + 1] - levels[i] >= 2 && levels[i] >= defLevel) {
      return levels[i] + 1;
    }
  }
  return Math.max(levels[levels.length - 1], defLevel) + 1;
}

function checkLineStyle(nodeLevel, curIndex, foundSim) {
  let increase = false;
  for (const i in nodeLevel) {
    for (let j = 0; j < nodeLevel[i].length; j++) {
      if (i == curIndex.key && j == curIndex.index) return increase;

      if (arraysEqual(nodeLevel[curIndex.key][curIndex.index].range, nodeLevel[i][j].range)) {
        nodeLevel[curIndex.key][curIndex.index].level = nodeLevel[i][j].level - 1;
        foundSim.hit = true;
        foundSim.level = nodeLevel[curIndex.key][curIndex.index].range;
        return true;
      }
      if (possibleIncreaseLevel(nodeLevel[curIndex.key][curIndex.index].range, nodeLevel[i][j].range)) {
        nodeLevel[curIndex.key][curIndex.index].possibleLevelUps.push(nodeLevel[i][j].level);
      } else if (increaseLevel(nodeLevel[curIndex.key][curIndex.index].range, nodeLevel[i][j].range)) {
        if (nodeLevel[curIndex.key][curIndex.index].level < nodeLevel[i][j].level) {
          nodeLevel[curIndex.key][curIndex.index].possibleLevelUp = nodeLevel[i][j].level;
        }

        increase = true;
        nodeLevel[curIndex.key][curIndex.index].level = Math.max(
          nodeLevel[curIndex.key][curIndex.index].level,
          nodeLevel[i][j].level
        );
        let max = Math.max(...nodeLevel[curIndex.key][curIndex.index].possibleLevelUps);
      }
    }
  }
  return increase;
}

function checkLineStyleConflicted(nodeLevel, curIndex) {
  let conflicted = false;
  for (const i in nodeLevel) {
    for (let j = 0; j < nodeLevel[i].length; j++) {
      if (i == curIndex.key && j == curIndex.index) return conflicted;

      if (isConflict(nodeLevel[curIndex.key][curIndex.index].range, nodeLevel[i][j].range)) {
        setEdgeBez(nodeLevel[curIndex.key][curIndex.index].node.connectedEdges());
        nodeLevel[curIndex.key][curIndex.index].range = [-2, -1];
        return true;
      }
    }
  }
  return conflicted;
}

function setSharedNodes(cy, parents, nodes, yMax) {
  let persons = {
    idList: parents,
    eventMaxY: new Array(parents.length).fill(0),
    identifierMaxY: new Array(parents.length).fill(0),
  };
  for (let i = 0; i < persons.idList.length; i++) {
    persons[persons.idList[i]] = {};
    persons[persons.idList[i]].maxlevel = 1;
  }
  let nodeLevel = {};

  nodes = nodes.sort((a, b) => {
    return getPersonWidth(a, parents) < getPersonWidth(b, parents) ? -1 : 1;
  });

  let tempNodes = [];
  for (let i = 0; i < nodes.length; i++) {
    if (getPersonWidthIndexs(nodes[i], parents).length > 1) {
      tempNodes.push(nodes[i]);
    }
  }
  nodes = tempNodes;

  for (let j = 0; j < nodes.length; j++) {
    if (nodeLevel[0] == undefined) {
      nodeLevel[0] = [];
    }
    nodeLevel[0].push({
      node: nodes[j],
      range: getPersonWidthIndexs(nodes[j], parents).sort((a, b) => a - b),
      level: 1,
      conflict: false,
      possibleLevelUps: [],
    });
  }

  let increase = false;
  let count = 0;
  let maxConflictLevel = 0;
  let conflictCount = 0;

  for (const i in nodeLevel) {
    count++;
    for (let j = 0; j < nodeLevel[i].length; j++) {
      increase = checkLineStyleConflicted(nodeLevel, { key: i, index: j });
      if (increase) conflictCount++;

      let childParents = nodeListToArray(
        nodeLevel[i][j].node
          .connectedEdges()
          .connectedNodes(`node[type = "person"][id != "${nodeLevel[i][j].node.id()}"]`)
      );

      let placementParent = findPlacementParent(persons.idList, childParents);

      if (increase) {
        nodeLevel[i][j].node.position({
          x: cy.nodes(`node[id = "${placementParent}"]`).position('x'),
          y: -150 + -150 * persons[placementParent].maxlevel++,
        });
        maxConflictLevel = Math.max(maxConflictLevel, persons[placementParent].maxlevel);
      }
    }
  }

  let simRangeObj = {};

  for (const i in nodeLevel) {
    count++;
    let foundSimCount = 0;
    for (let j = 0; j < nodeLevel[i].length; j++) {
      let foundSim = { hit: false };

      increase = checkLineStyle(nodeLevel, { key: i, index: j }, foundSim);

      if (foundSim.hit != false) {
        foundSim = foundSim.level.join('');
        simRangeObj[foundSim] = simRangeObj[foundSim] == undefined ? 1 : simRangeObj[foundSim] + 1;
        foundSimCount = simRangeObj[foundSim];
      }
      if (increase || (nodeLevel[i][j].possibleLevelUps.length > 0 && !nodeLevel[i][j].conflict)) {
        if (!increase && nodeLevel[i][j].level == 1 && nodeLevel[i][j].possibleLevelUps[0] > 1) {
        } else {
          nodeLevel[i][j].level = findLevelUp(nodeLevel[i][j].possibleLevelUps, nodeLevel[i][j].level);
        }
      }

      let childParents = nodeListToArray(
        nodeLevel[i][j].node
          .connectedEdges()
          .connectedNodes(`node[type = "person"][id != "${nodeLevel[i][j].node.id()}"]`)
      );

      let placementParent = findPlacementParent(persons.idList, childParents);

      if (nodeLevel[i][j].node.connectedEdges().style('curve-style') != 'segments') {
        nodeLevel[i][j].node.position({
          x: cy.nodes(`node[id = "${placementParent}"]`).position('x') + 150 + foundSimCount * 75,
          y: nodeLevel[i][j].level * -150 + maxConflictLevel * -150,
        });
        increase = false;
      }
      foundSimCount = 0;
    }
  }
  configBezEdges(cy, parents, nodes);
}

export default function layoutB(cy) {
  setEdgesTaxi(cy.edges());
  let persons = getPersonsBySharedNodes(cy);

  let events, identifiers, parent;
  colorCode(cy);
  resetData(cy);
  enlargePersons();
  highlightConnectedEdges('node', 'red');
  let prevMax = [0, 0];
  let yMax = 0;

  for (let i = 0; i < persons.length; i++) {
    parent = cy.$id(persons[i]);
    events = getEventsFromPerson(cy, persons[i]);
    identifiers = getIdentifiersFromPerson(cy, persons[i]);

    if (identifiers.unique.length > 0) {
      prevMax = setEvents(cy, identifiers.unique, options, { x: prevMax[0], y: 0 });
    }

    prevMax[0] += 150;
    yMax = Math.min(prevMax[1], yMax);

    parent.position({ x: prevMax[0], y: 0 });

    if (events.unique.length > 0) {
      prevMax = setEvents(cy, events.unique, options, { x: prevMax[0], y: 0 });
    }

    prevMax[0] += 150;
    yMax = Math.min(prevMax[1], yMax);
  }

  return setSharedNodes(
    cy,
    persons,
    cy.nodes(`node[type = "event"][_used != "true"], node[type = "identifier"][_used != "true"]`),
    -300
  );
}
