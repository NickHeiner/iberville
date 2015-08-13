import '../types';
import logger = require('../util/logger/index');
import generateVoronoi = require('./generate-voronoi');

const turfExtent = require('turf-extent'),
    turfFeatureCollection = require('turf-featurecollection'),
    _ = require('lodash');

function generateRiver(opts: IGenerateCityOpts): GeoJSON.FeatureCollection {
    const potentialRiverEdges = generateVoronoi(opts),
        extent = turfExtent(potentialRiverEdges);

    function generateRiverRec(
        potentialRiverEdges: GeoJSON.FeatureCollection,
        countToGenerate: number
    ): GeoJSON.Feature[] {
        if (countToGenerate === 0) {
            return [];
        }

         const startingPoint = _(potentialRiverEdges)
            .filter((feature: GeoJSON.Feature) => {
                 const wIsOnEdge = _.contains([extent[0], extent[2]], feature.geometry.coordinates[0][0])
             }
    }

    logger.warn({extent: extent});

    return turfFeatureCollection(generateRiverRec(potentialRiverEdges, opts.river.count));
}

export = generateRiver;
