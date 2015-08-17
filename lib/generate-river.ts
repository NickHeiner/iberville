import '../types';
import logger = require('../util/logger/index');
import generateVoronoi = require('./generate-voronoi');

const turfFeatureCollection = require('turf-featurecollection'),
    Alea = require('alea'),
    _ = require('lodash');

function generateRiver(opts: IGenerateCityOpts): GeoJSON.FeatureCollection {
    // TODO consider factoring creation of pRNG out so it is consistent.
    const pRNG = new Alea(opts.seed);

    function sampleFromList<T>(list: T[]): {element: T; rest: T[]} {
        const randomIndex = Math.floor(pRNG() * list.length),
            listClone = _.cloneDeep(list),
            sampledElement = _.pullAt(listClone, randomIndex)[0];

        return {element: sampledElement, rest: listClone};
    }

    function generateRiverRec(
        currLine: GeoJSON.Feature,
        potentialRiverEdges: GeoJSON.Feature[]
    ): GeoJSON.Feature[] {
        const potentialNextLines: GeoJSON.Feature[] = _.filter(
            potentialRiverEdges,
            (feature: GeoJSON.Feature) => _.isEqual(feature.geometry.coordinates[0], currLine.geometry.coordinates[1])
        );

        logger.warn({potentialNextLinesCount: potentialNextLines.length}, 'Found potential river continuations');

        if (!potentialNextLines.length) {
            return [];
        }

        const {element, rest} = sampleFromList(potentialNextLines);

        return [element].concat(generateRiverRec(element, rest));
    }

    const {points, lines} = generateVoronoi(opts),

        // TODO this only selects a subset of the actual starting points, but I'm ok with that for now.
        potentialStartLines: GeoJSON.Feature[] = _.filter(
            lines.features,
            (feature: GeoJSON.Feature) => feature.properties.firstCoordTouchesPerimeter
        ),

        {element, rest} = sampleFromList(potentialStartLines);

    logger.warn({chosenStartPoint: element}, 'Found potential start lines');

    return turfFeatureCollection(
        generateRiverRec(element, rest)
            .concat(points.features)
            .concat(opts.river.debug.includeVoronoiLinesInOutput ? lines.features : [])
    );
}

export = generateRiver;
