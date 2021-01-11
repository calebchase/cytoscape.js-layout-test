fs = require('fs');

options = {
  event: {
    range: [1, 3],
    sharedPercent: 0.2,
  },
  person: {
    range: [10, 15],
  },
  identifier: {
    range: [1, 3],
    sharedPercent: 0.2,
  },
};

function randomNumInRange(start, end) {
  return Math.floor(Math.random() * (end + 1 - start) + start);
}

function createPersons(eles, options) {
  let count = randomNumInRange(options.person.range[0], options.person.range[1]);
  let i;

  for (i = 0; i < count; i++) {
    eles.push({
      group: 'nodes',
      data: {
        type: 'person',
        id: `node:person:${i}`,
      },
    });
  }
  return eles.length;
}

function createEdges(eles, type, count, options) {
  let createEdge = false;

  for (let i = 0; i < count; i++) {
    for (let j = 0; j < count; j++) {
      if (i == j) {
        continue;
      }

      createEdge = Math.random() < options[type].sharedPercent;

      if (createEdge) {
        let sharedCount = randomNumInRange(options[type].range[0], options[type].range[1]);

        for (let k = 0; k < sharedCount; k++) {
          eles.push({
            group: 'edges',
            data: {
              type: type,
              id: `edge:${type}:${k}:${i}->${j}`,
              source: `node:person:${i}`,
              target: `node:person:${j}`,
            },
          });
        }
      }
    }
  }
}

function generateElements(options) {
  let eles = [];
  let count = -1;

  count = createPersons(eles, options);
  createEdges(eles, 'event', count, options);
  createEdges(eles, 'identifier', count, options);

  return eles;
}

let elements = generateElements(options);

fs.writeFile('../src/node.txt', JSON.stringify(elements), function (err) {
  if (err) return console.log(err);
});
