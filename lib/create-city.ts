'use strict';

import getStreetGrid = require('./get-street-grid');
import generateRiver = require('./generate-river');
import removeIntersectingElements = require('./remove-intersecting-elements');

function createCity(opts: IGenerateCityOpts): GeoJSON.FeatureCollection {
    const streetGrid = getStreetGrid(opts),
        river = generateRiver(opts);

    return removeIntersectingElements([streetGrid, river]);
}

export = createCity;
