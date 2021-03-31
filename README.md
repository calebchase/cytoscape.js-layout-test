# cytoscape-trilayer

## Description

Trilayer is a specialized layout for a relatively small set of parent nodes and a relatively large set of children nodes. The children nodes are categorized into two types and are able to have multiple parents.

## Dependencies

- cytoscape: ^3.16.3

## Usage instructions

Download the library:

- via npm: `npm install cytoscape-trilayer`
- via direct download in the repository

ES import:

```js
import cytoscape from 'cytoscape';
import { register as trilayer } from 'cytoscape-trilayer';

cytoscape.use(trilayer);
```

CommonJS:

```js
let cytoscape = require('cytoscape');
let trilayer = require('cytoscape-trilayer');

cytoscape.use(trilayer);
```

AMD:

```js
require(['cytoscape', 'cytoscape-trilayer'], function (cytoscape, trilayer) {
  trilayer(cytoscape);
});
```

## API

Specify an options object with `name: 'trilayer'` to run the layout. All other fields are optional. An example with the default options follows:

```js
let options = {
  name: 'trilayer',
  horizontalNodeOffset: 150,
  verticalNodeOffset: 150,
  parentToChildSpacing: 150,

  // Offset for shared nodes that are placed on the same level in taxi section of graph
  horizontalSharedOffset: 75,

  // Querey can be any cytoscape query
  parentQuery: 'node[type = "person"]',
  childAQuery: 'node[type = "identifier"]',
  childBQuery: 'node[type = "event"]',
};

cy.layout(options).run();
```
