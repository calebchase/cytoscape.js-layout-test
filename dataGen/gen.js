fs = require('fs');

let eventsCount = 5;
let peopleCount = 50;
let identifiersCount = 100;
let eles = [];

// Takes in an array an randomly sorts the elements
function shuffle(o) {
  for (
    var j, x, i = o.length;
    i;
    j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x
  );
  return o;
}

// Generates a list of random ints from 0 to max
function makeRandomList(max) {
  let arr = [];
  for (let i = 0; i < max; i++) {
    arr.push(i);
  }
  return shuffle(arr);
}

// Pushes count number of type nodes and pushes to destArr
function pushNodes(type, count, destArr) {
  for (let i = 0; i < count; i++) {
    destArr.push({ group: 'nodes', data: { id: `node:${type}:${i}`, type: type } });
  }
}

// Creates edges between source and target using source/target arr to determine connections
function pushEdges(sourceType, sourceArr, targetType, targetArr, destArr) {
  sourceLength = sourceArr.length;
  targetLength = targetArr.length;
  maxNum = Math.max(sourceLength, targetLength);

  for (let i = 0; i < maxNum; i++) {
    destArr.push({
      group: 'edges',
      data: {
        id: `edge:${sourceType}:${targetType}:${i}`,
        source: `node:${sourceType}:${sourceArr[i % sourceLength]}`,
        target: `node:${targetType}:${targetArr[i % targetLength]}`,
      },
    });
  }
}

pushNodes('events', eventsCount, eles);
pushNodes('people', peopleCount, eles);
pushNodes('identifiers', identifiersCount, eles);

pushEdges('events', makeRandomList(eventsCount), 'people', makeRandomList(peopleCount), eles);
pushEdges(
  'people',
  makeRandomList(peopleCount),
  'identifiers',
  makeRandomList(identifiersCount),
  eles
);

fs.writeFile('../src/node.txt', JSON.stringify(eles), function (err) {
  if (err) return console.log(err);
});
