export default function nodeOffset(nodes, start, offset) {
  let nodesSize = nodes.size();
  if (nodesSize > 0) {
    nodes[0].position(start);
    start.x += offset;
  }

  for (let i = 1; i < nodes.size(); i++) {
    nodes[i].position(start);
    start.x += offset;
  }
}
