fs = require('fs');

options = {
  event: {
    count: 5,
  },
  person: {
    rangePerNode: [3, 5],
    sharedRange: [1, 2],
    sharedPercent: 0.15,
  },
  identifier: {
    rangePerNode: [2, 3],
    sharedRange: [1, 2],
    sharedPercent: 0.1,
  },
};

// function pushNode(node, eles) {
//   eles.push({ group: 'nodes', data: { id: `node:${node.type}:${node.i}`, type: node.type } });
// }

function randomNumInRange(start, end) {
  return Math.floor(Math.random() * (end + 1 - start) + start);
}

function getOtherParent(parentId, parentTotal, childOptions) {
  let newParents = [];
  if (Math.random() <= childOptions.sharedPercent) {
    let edgeCount = randomNumInRange(childOptions.sharedRange[0], childOptions.sharedRange[1]);

    for (let i = 0; i < edgeCount; i++) {
      let newParent = Math.floor(Math.random() * parentTotal);

      while (newParent == parentId || newParents.includes(newParent)) {
        newParent = Math.floor(Math.random() * parentTotal);
      }
      newParents.push(newParent);
    }
  }
  return newParents;
}

function pushNodes(type, count, eles) {
  for (let i = 0; i < count; i++) {
    eles.push({ group: 'nodes', data: { id: `node:${type}:${i}`, type: type } });
  }
}

function getChildNum(destOptions) {
  return randomNumInRange(destOptions.rangePerNode[0], destOptions.rangePerNode[1]);
}

function createEdge(srcType, srcNum, destType, destNum, eles) {
  eles.push({
    group: 'edges',
    data: {
      source: `node:${srcType}:${srcNum}`,
      target: `node:${destType}:${destNum}`,
    },
  });
}

function createEdges(srcType, srcArr, destType, destArr, eles) {
  let srcLength = srcArr.length;

  for (let i = 0; i < srcLength; i++) {
    createEdge(srcType, srcArr[i], destType, destArr[i], eles);
  }
}

function pushEdges(srcType, srcCount, destType, destOptions, eles) {
  let srcArr = [];
  let destArr = [];
  let srcEdge = [];
  let destEdge = [];
  let otherParents = [];
  let childId = 0;

  for (let i = 0; i < srcCount; i++) {
    let childNum = getChildNum(destOptions);
    for (let j = 0; j < childNum; j++) {
      srcArr.push(i);
      destArr.push(childId);

      let otherParents = getOtherParent(i, srcCount, destOptions);
      for (let k = 0; k < otherParents.length; k++) {
        srcEdge.push(otherParents[k]);
        destEdge.push(childId);
      }
      childId++;
    }
  }
  pushNodes(destType, destArr.length, eles);
  createEdges(srcType, srcArr, destType, destArr, eles);
  createEdges(srcType, srcEdge, destType, destEdge, eles);
  return childId;
}

function generateElements(options) {
  let eles = [];
  let childCount;

  pushNodes('event', options.event.count, eles);
  childCount = pushEdges('event', options.event.count, 'person', options.person, eles);
  pushEdges('person', childCount, 'identifier', options.identifier, eles);

  return eles;
}

let elements = generateElements(options);

fs.writeFile('../src/node.txt', JSON.stringify(elements), function (err) {
  if (err) return console.log(err);
});
