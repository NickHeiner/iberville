import '../types';
import logger = require('../util/logger/index');
import generateVoronoi = require('./generate-voronoi');

const turfExtent = require('turf-extent'),
    turfPoint = require('turf-point'),
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

        const potentialStartLines = _.filter(
            potentialRiverEdges.features,
            (feature: GeoJSON.Feature) => feature.properties.firstCoordTouchesPerimeter
        );

        return _.map(potentialStartLines, (line: GeoJSON.Feature) => turfPoint(line.geometry.coordinates[0]));
    }

    return turfFeatureCollection(generateRiverRec(potentialRiverEdges, opts.river.count));
}

export = generateRiver;
