'use strict';

import getStreetGrid = require('./get-street-grid');
import generateRiver = require('./generate-river');

const turfFeatureCollection = require('turf-featurecollection');

function createCity(opts: IGenerateCityOpts): GeoJSON.FeatureCollection {
    const streetGrid = getStreetGrid(opts),
        river = generateRiver(opts);

    return turfFeatureCollection(streetGrid.features.concat(river.features));
}

export = createCity;
