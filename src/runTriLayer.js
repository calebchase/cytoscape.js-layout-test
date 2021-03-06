import configSegEdges from './simpleEdgeBund.js';

var startTime;

function start() {
  startTime = new Date();
}

function end() {
  let endTime = new Date();
  var timeDiff = endTime - startTime; //in ms

  var seconds = Math.round(timeDiff);
  console.log(seconds + ' seconds');
}

function resetData(cy) {
  let nodes = cy.elements('node[_used = "true"]');
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].data('_used', 'false');
    nodes[i].data('_taxiSet', 'false');
  }
}

function setPriority(parents, percent) {
  for (let i = 0; i < parents.length; i++) {
    if (Math.random() > percent) {
      let node = parents[i];
      node.data('priority', Math.random());
    }
  }
}

function getParentsByPriority(parents, options) {
  let priorityParents = [];
  let nonPriorityParents = [];

  let count = 0;

  for (let parent of parents) {
    if (parent.data('priority') != undefined) {
      priorityParents.push(parent);
      parent.style('background-color', 'lightgreen');
      count++;
    } else {
      nonPriorityParents.push(parent);
    }
    priorityParents.sort(options.priorityFunction);
  }
  return { priority: priorityParents, nonPriority: nonPriorityParents };
}

function setEdgeSegment(edge) {
  edge.data({
    type: 'segment',
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

function getNumOfSharedNodes(nodeA, nodeB) {
  let nodeAChildren = nodeA.connectedEdges().connectedNodes();
  let nodeBChildren = nodeB.connectedEdges().connectedNodes();
  return nodeAChildren.filter((value) => nodeBChildren.includes(value)).length;
}

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function getPersonsBySharedNodes(cy, options) {
  let persons = cy.elements(options.parentQuery);

  let personsIdArr = [];
  let maxList = [];
  let fastList = [];
  let maxCount = -1;
  let orderedPersons = {};

  let arrayList = [];

  //setPriority(persons, 0.5);

  let personsPrioritySort = getParentsByPriority(persons, options);
  let priorityParents = personsPrioritySort.priority;
  persons = personsPrioritySort.nonPriority;

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
    fastList = [];
    fastList.push(personsIdArr[k]);
    maxTempCount = 0;

    for (let i = 0; i < personsIdArr.length - 1; i++) {
      let maxId;
      let maxIdCount = 0;

      for (let j = 0; j < personsIdArr.length - 1; j++) {
        if (
          fastList[i] &&
          personsIdArr[i] &&
          orderedPersons[fastList[i]][personsIdArr[j]] > maxIdCount &&
          !fastList.includes(personsIdArr[j])
        ) {
          maxIdCount = orderedPersons[fastList[i]][personsIdArr[j]];
          maxId = personsIdArr[j];
        }
      }
      if (maxId) fastList.push(maxId);
      maxTempCount += maxIdCount;
    }
    arrayList.push(fastList);

    if (maxTempCount > maxCount) {
      maxCount = maxTempCount;
      maxList = fastList;
    }

    for (let j = 0; j < personsIdArr.length; j++) {
      if (!fastList.includes(personsIdArr[j])) {
        fastList.push(personsIdArr[j]);
      }
    }
  }

  let finalPersonList = [];
  for (let i = 0; i < priorityParents.length; i++) {
    finalPersonList.push(priorityParents[i].id());
  }

  let asdfddsa;
  let minConflictCount = Infinity;

  for (let i = 0; i < arrayList.length; i++) {
    let conflictCount;
    let tempPersonList = finalPersonList.concat(arrayList[i]);

    conflictCount = getConflictedCount(
      cy,
      tempPersonList,
      cy.nodes(`${options.childAQuery}[_used != "true"], ${options.childBQuery}[_used != "true"]`),
      options
    );

    console.log(conflictCount);
    if (conflictCount < minConflictCount) {
      minConflictCount = conflictCount;
      asdfddsa = tempPersonList;
    }
  }

  finalPersonList = finalPersonList.concat(maxList);
  return asdfddsa;
}

function getChildrenFromPerson(cy, personId, query) {
  let person = cy.$id(personId);
  let events = {
    unique: [],
    shared: [],
  };
  let children = person.connectedEdges().connectedNodes(`${query}[_used != 'true']`);

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

function setEvents(cy, events, options, start) {
  let eventsDim = Math.ceil(Math.sqrt(events.length));
  let offsetMult = 1;
  let xMax = [0, 0];
  let xMult = 0;

  for (let i = 0; i < events.length; i++) {
    events[i].position({
      x: start.x + options.horizontalNodeOffset * xMult++,
      y: start.y + options.verticalNodeOffset * offsetMult,
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

function nodeListToArray(nodes) {
  let array = [];
  for (let i = 0; i < nodes.length; i++) {
    array.push(nodes[i].id());
  }
  return array;
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

function getPersonWidthIndexs(node, parents, options) {
  let childParents = nodeListToArray(
    node.connectedEdges().connectedNodes(`${options.parentQuery}[id != "${node.id()}"]`)
  );

  let parentIndexArr = [];

  for (let j = 0; j < parents.length; j++) {
    if (childParents.includes(parents[j])) {
      parentIndexArr.push(j);
    }
  }
  return parentIndexArr.sort((a, b) => a - b);
}

function getPersonWidth(node, parents, options) {
  let childParents = nodeListToArray(
    node.connectedEdges().connectedNodes(`${options.parentQuery}[id != "${node.id()}"]`)
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
      }
    }
  }
  return increase;
}

function checkLineStyleConflicted(nodeLevel, curIndex, dontSetEdge) {
  let conflicted = false;
  for (const i in nodeLevel) {
    for (let j = 0; j < nodeLevel[i].length; j++) {
      if (i == curIndex.key && j == curIndex.index) return conflicted;

      if (isConflict(nodeLevel[curIndex.key][curIndex.index].range, nodeLevel[i][j].range)) {
        if (!dontSetEdge) setEdgeSegment(nodeLevel[curIndex.key][curIndex.index].node.connectedEdges());
        nodeLevel[curIndex.key][curIndex.index].range = [-2, -1];
        return true;
      }
    }
  }
  return conflicted;
}

function getConflictedCount(cy, parents, nodes, options) {
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
    return getPersonWidth(a, parents, options) < getPersonWidth(b, parents, options) ? -1 : 1;
  });

  let tempNodes = [];
  for (let i = 0; i < nodes.length; i++) {
    if (getPersonWidthIndexs(nodes[i], parents, options).length > 1) {
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
      range: getPersonWidthIndexs(nodes[j], parents, options).sort((a, b) => a - b),
      level: 1,
      conflict: false,
      possibleLevelUps: [],
    });
  }

  let increase = false;
  let count = 0;
  let maxConflictLevel = 0;

  for (const i in nodeLevel) {
    for (let j = 0; j < nodeLevel[i].length; j++) {
      increase = checkLineStyleConflicted(nodeLevel, { key: i, index: j }, true);

      let childParents = nodeListToArray(
        nodeLevel[i][j].node
          .connectedEdges()
          .connectedNodes(`${options.parentQuery}[id != "${nodeLevel[i][j].node.id()}"]`)
      );

      let placementParent = findPlacementParent(persons.idList, childParents);

      if (increase) {
        count++;

        maxConflictLevel = Math.max(maxConflictLevel, persons[placementParent].maxlevel);
      }
    }
  }
  return count;
}

function setSharedNodes(cy, parents, nodes, options) {
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
    return getPersonWidth(a, parents, options) < getPersonWidth(b, parents, options) ? -1 : 1;
  });

  let tempNodes = [];
  for (let i = 0; i < nodes.length; i++) {
    if (getPersonWidthIndexs(nodes[i], parents, options).length > 1) {
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
      range: getPersonWidthIndexs(nodes[j], parents, options).sort((a, b) => a - b),
      level: 1,
      conflict: false,
      possibleLevelUps: [],
    });
  }

  let increase = false;
  let count = 0;
  let maxConflictLevel = 0;

  for (const i in nodeLevel) {
    for (let j = 0; j < nodeLevel[i].length; j++) {
      increase = checkLineStyleConflicted(nodeLevel, { key: i, index: j });

      let childParents = nodeListToArray(
        nodeLevel[i][j].node
          .connectedEdges()
          .connectedNodes(`${options.parentQuery}[id != "${nodeLevel[i][j].node.id()}"]`)
      );

      let placementParent = findPlacementParent(persons.idList, childParents);

      if (increase) {
        count++;

        nodeLevel[i][j].node.position({
          x: cy.nodes(`node[id = "${placementParent}"]`).position('x'),
          y:
            -options.parentToChildSpacing + -options.verticalNodeOffset * persons[placementParent].maxlevel++,
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
          .connectedNodes(`${options.parentQuery}[id != "${nodeLevel[i][j].node.id()}"]`)
      );

      let placementParent = findPlacementParent(persons.idList, childParents);

      if (nodeLevel[i][j].node.connectedEdges().style('curve-style') != 'segments') {
        nodeLevel[i][j].node.position({
          x:
            cy.nodes(`node[id = "${placementParent}"]`).position('x') +
            options.horizontalNodeOffset +
            foundSimCount * options.horizontalSharedOffset,
          y:
            -options.parentToChildSpacing +
            nodeLevel[i][j].level * -options.verticalNodeOffset +
            maxConflictLevel * -options.verticalNodeOffset,
        });
        increase = false;
      }
      foundSimCount = 0;
    }
  }
  configSegEdges(cy, parents, nodes);
}

function runTriLayer(options, cy) {
  start();
  resetData(cy);

  let persons = getPersonsBySharedNodes(cy, options);
  let events, identifiers, parent;
  let prevMax = [0, 0];
  let yMax = 0;

  setEdgesTaxi(cy.edges());

  for (let i = 0; i < persons.length; i++) {
    parent = cy.$id(persons[i]);
    events = getChildrenFromPerson(cy, persons[i], options.childAQuery);
    identifiers = getChildrenFromPerson(cy, persons[i], options.childBQuery);

    if (identifiers.unique.length > 0) {
      prevMax = setEvents(cy, identifiers.unique, options, { x: prevMax[0], y: 0 }, options);
    }

    prevMax[0] += options.horizontalNodeOffset;
    yMax = Math.min(prevMax[1], yMax);

    parent.position({ x: prevMax[0], y: 0 });

    if (events.unique.length > 0) {
      prevMax = setEvents(cy, events.unique, options, { x: prevMax[0], y: 0 }, options);
    }

    prevMax[0] += options.horizontalNodeOffset;
    yMax = Math.min(prevMax[1], yMax);
  }

  setSharedNodes(
    cy,
    persons,
    cy.nodes(`${options.childAQuery}[_used != "true"], ${options.childBQuery}[_used != "true"]`),
    options
  );

  end();
}

function Layout(options) {
  let defaults = {
    horizontalNodeOffset: 150,
    verticalNodeOffset: 150,
    parentToChildSpacing: 150,
    horizontalSharedOffset: 75,
    parentQuery: 'node[type = "person"]',
    childAQuery: 'node[type = "identifier"]',
    childBQuery: 'node[type = "event"]',
    parentPriority: 'priority',
    priorityFunction: (a, b) => a.data('priority') - b.data('priority'),
  };

  this.cy = options.cy;
  this.options = { ...defaults, ...options };
}

Layout.prototype.run = function () {
  runTriLayer(this.options, this.cy);
};

export { Layout };
