# cytoscape-tri-layer

## Description

- via direct download

## Dependencies

- cytoscape: ^3.16.3

## Usage instructions

- Download the library:
- via npm: `npm install cytoscape-tri-layer`

ES import:

```js
import cytoscape from 'cytoscape';
cytoscape.use(trilayer);

import { register as trilayer } from './index.js';
```

## API

```js
let cy = cytoscape({ ... });

let options = {
  horizontalNodeOffset: 150,
  verticalNodeOffset: 150,
  parentToChildSpacing: 150,
  horizontalSharedOffset: 75,
  parentQuery: 'node[type = "person"]',
  childAQuery: 'node[type = "identifier"]',
  childBQuery: 'node[type = "event"]',
};

cy.trilayer(options);
```
