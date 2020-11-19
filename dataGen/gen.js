fs = require('fs');

let eventsCount = 5;
let peopleCount = 50;
let identifiersCount = 100;
let nodes = [];

function pushNodes(type, count) {
  for (let i = 0; i < count; i++) {
    nodes.push({ data: { id: `node:${type}:${i}`, type: type } });
  }
}

pushNodes('events', eventsCount);
pushNodes('people', peopleCount);
pushNodes('identifiers', identifiersCount);

fs.writeFile('../src/node.txt', JSON.stringify(nodes), function (err) {
  if (err) return console.log(err);
});
