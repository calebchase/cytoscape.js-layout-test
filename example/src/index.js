import { runTriLayer } from './runTriLayer.js';

function register(cytoscape) {
  if (!cytoscape) {
    console.warn('Attempt to register cytoscape-layoutB with invalid cytoscape instance!');
    return;
  }
  cytoscape('core', 'trilayer', runTriLayer);
}

// auto-register if there is global cytoscape (i.e. window.cytoscape)
if (typeof cytoscape !== 'undefined') {
  register(cytoscape);
}

export { register };
