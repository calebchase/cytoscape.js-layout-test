fs = require('fs');

let eventImages = ['eventA.png', 'eventB.png'];
let personImages = ['personA.png', 'personB.png'];
let idenImages = ['idenA.png', 'idenB.png', 'idenC.png'];

function randomFromArray(arr) {
  let index = Math.floor(Math.random() * arr.length);
  return arr[index];
}

options = {
  event: {
    count: 7,
  },
  person: {
    rangePerNode: [7, 20],
    sharedRange: [1, 3],
    sharedPercent: 0.0,
  },
  identifier: {
    rangePerNode: [7, 20],
    sharedRange: [1, 3],
    sharedPercent: 0.0,
  },
};

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
  let img;

  for (let i = 0; i < count; i++) {
    if (type == 'event') {
      img = randomFromArray(eventImages);
    } else if (type == 'person') {
      img = randomFromArray(personImages);
      console.log('hit');
    } else if (type == 'identifier') {
      img = randomFromArray(idenImages);
    }
    eles.push({
      group: 'nodes',
      data: {
        id: `node:${type}:${i}`,
        type: type,
        image: `./images/${img}`,
      },
    });
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

  pushNodes('person', options.event.count, eles);
  childCount = pushEdges('person', options.event.count, 'event', options.person, eles);
  pushEdges('person', options.event.count, 'identifier', options.identifier, eles);

  return eles;
}

for (let i = 0; i < 1; i++) {
  let elements = generateElements(options);

  fs.writeFile(`../example/src/testData${i}.txt`, JSON.stringify(elements), function (err) {
    if (err) return console.log(err);
  });
}

// fs.writeFile('../src/node.txt', JSON.stringify(elements), function (err) {
//   if (err) return console.log(err);
// });
