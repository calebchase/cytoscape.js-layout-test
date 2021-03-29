function lineDistance(a, b) {
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

function calculateSegDistance(edge, targetPoint) {
  let startPoint = edge.source().position();
  let endPoint = edge.target().position();
  let sign = getSign(startPoint.x, endPoint.x);

  targetPoint.x += sign * 300;

  let mainSlope = (startPoint.y - endPoint.y) / (startPoint.x - endPoint.x);
  let intersectSlope = -(1 / mainSlope);
  let mainB = endPoint.y - mainSlope * endPoint.x;

  let intersectB = targetPoint.y - intersectSlope * targetPoint.x;

  let intersectX = (intersectB - mainB) / (mainSlope - intersectSlope);
  let intersectY = intersectSlope * intersectX + intersectB;

  let distance = lineDistance({ x: targetPoint.x, y: targetPoint.y }, { x: intersectX, y: intersectY });

  let weight =
    lineDistance(startPoint, { x: intersectX, y: intersectY }) / lineDistance(startPoint, endPoint);

  sign = -getDir(targetPoint.y, intersectY) * sign;

  edge.style({
    'segment-distances': `${-sign * distance} `,
    'segment-weights': `${weight} `,
  });
}

function setPoints(sameX) {
  for (const key in sameX) {
    let nodes = sameX[key].nodes;
    let parent = sameX[key].parent;
    let minYval = -Infinity;
    if (nodes.length < 2) continue;
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].position('y') > minYval) {
        minYval = nodes[i].position('y');
      }
    }

    if (minYval != -Infinity && nodes.length > 1) {
      for (let i = 0; i < nodes.length; i++) {
        let edges = parent.connectedEdges(`edge[type = "segment"]`);

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

export default function configSegEdges(cy, parents) {
  for (let i = 0; i < parents.length; i++) {
    let targetNodes = cy.$id(parents[i]).connectedEdges(`edge[type = "segment"]`).connectedNodes();
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
    setPoints(sameX);
  }
}
