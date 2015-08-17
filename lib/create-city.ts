'use strict';

import getStreetGrid = require('./get-street-grid');
import generateRiver = require('./generate-river');
import removeIntersectingElements = require('./remove-intersecting-elements');
import logStep = require('../util/logger/log-step');

function createCity(opts: IGenerateCityOpts): GeoJSON.FeatureCollection {
    const streetGrid = logStep({step: 'generating street grid'}, () => getStreetGrid(opts)),
        river = logStep({step: 'generating river'}, () => generateRiver(opts));

    return logStep({step: 'removing intersecting elements'}, () => removeIntersectingElements([streetGrid, river]));
}

export = createCity;
