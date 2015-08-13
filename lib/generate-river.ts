import '../types';
import logger = require('../util/logger/index');
import generateVoronoi = require('./generate-voronoi');

const turfPoint = require('turf-point'),
    turfFeatureCollection = require('turf-featurecollection'),
    _ = require('lodash');

function generateRiver(opts: IGenerateCityOpts): GeoJSON.FeatureCollection {
    const potentialRiverEdges = generateVoronoi(opts);

    function generateRiverRec(
        potentialRiverEdges: GeoJSON.FeatureCollection,
        countToGenerate: number
    ): GeoJSON.Feature[] {
        if (countToGenerate === 0) {
            return [];
        }

        // TODO this only selects a subset of the actual starting points, but I'm ok with that for now.
        const potentialStartLines = _.filter(
            potentialRiverEdges.features,
            (feature: GeoJSON.Feature) => feature.properties.firstCoordTouchesPerimeter
        );

        logger.trace({potentialStartLines}, 'Found potential start lines');

        return _.map(potentialStartLines, (line: GeoJSON.Feature) => turfPoint(line.geometry.coordinates[0]));
    }

    return turfFeatureCollection(generateRiverRec(potentialRiverEdges, opts.river.count));
}

export = generateRiver;
