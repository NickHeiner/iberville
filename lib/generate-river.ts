import '../types';
// import logger = require('../util/logger/logger');

// const voronoi = require('voronoi');
const turfFeatureCollection = require('turf-featurecollection');

function generateRiver(opts: IGenerateCityOpts) {
    return turfFeatureCollection([]);
}

export = generateRiver;
