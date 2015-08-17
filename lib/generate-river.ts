import '../types';
import logger = require('../util/logger/index');
import generateVoronoi = require('./generate-voronoi');

const turfFeatureCollection = require('turf-featurecollection'),
    Alea = require('alea'),
    _ = require('lodash');

function generateRiver(opts: IGenerateCityOpts): GeoJSON.FeatureCollection {
    const potentialRiverEdges = generateVoronoi(opts),

        // TODO consider factoring creation of pRNG out so it is consistent.
        pRNG = new Alea(opts.seed);

    function generateRiverRec(
        startPoint: number[],
        potentialRiverEdges: GeoJSON.FeatureCollection,
        countToGenerate: number
    ): GeoJSON.Feature[] {
        if (countToGenerate === 0) {
            return [];
        }
        return [require('turf-point')(startPoint)];
    }

    // TODO this only selects a subset of the actual starting points, but I'm ok with that for now.
    const potentialStartLines = _.filter(
            potentialRiverEdges.features,
            (feature: GeoJSON.Feature) => feature.properties.firstCoordTouchesPerimeter
        ),
        randomIndex = pRNG() * potentialStartLines.length,
        startLine = potentialStartLines[Math.floor(randomIndex)];

    logger.warn({startLine: startLine, randomIndex: randomIndex}, 'Chose random start line');

    const chosenStartPoint = startLine.geometry.coordinates[0];

    logger.warn({chosenStartPoint}, 'Found potential start lines');

    return turfFeatureCollection(generateRiverRec(chosenStartPoint, potentialRiverEdges, opts.river.count));
}

export = generateRiver;
