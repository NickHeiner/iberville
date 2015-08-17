import '../types';
import logger = require('../util/logger/index');
import generateVoronoi = require('./generate-voronoi');

const turfFeatureCollection = require('turf-featurecollection'),
    turfLineString = require('turf-linestring'),
    Alea = require('alea'),
    _ = require('lodash');

function generateRiver(opts: IGenerateCityOpts): GeoJSON.FeatureCollection {
    // TODO consider factoring creation of pRNG out so it is consistent.
    const pRNG = new Alea(opts.seed);

    function sampleFromList<T>(list: T[]): T {
        const randomIndex = Math.floor(pRNG() * list.length),
            listClone = _.cloneDeep(list),
            sampledElement = _.pullAt(listClone, randomIndex)[0];

        return sampledElement;
    }

    function generateRiverRec(
        currLine: GeoJSON.Feature,
        potentialRiverEdges: GeoJSON.Feature[]
    ): GeoJSON.Feature[] {
        logger.trace({potentialRiverEdges: potentialRiverEdges}, 'Filtering potential river edges');

        const potentialNextLines: GeoJSON.Feature[] = _.filter(
            potentialRiverEdges,
            (feature: GeoJSON.Feature) => _.isEqual(feature.geometry.coordinates[0], currLine.geometry.coordinates[1])
        );

        logger.trace({
            potentialNextLinesCount: potentialNextLines.length, currLine
        }, 'Found potential river continuations');

        if (!potentialNextLines.length) {
            return [];
        }

        const nextLine = sampleFromList(potentialNextLines),
            remainingLines = _.without(potentialRiverEdges, nextLine),
            nextLineClone = _.cloneDeep(nextLine);

        nextLineClone.properties.chosenForRiver = true;

        return [nextLineClone].concat(generateRiverRec(nextLineClone, remainingLines));
    }

    const {points: debugPoints, lines: allRiverEdges} = generateVoronoi(opts),

        // TODO this only selects a subset of the actual starting points, but I'm ok with that for now.
        potentialStartLines: GeoJSON.Feature[] = _.filter(
            allRiverEdges.features,
            (feature: GeoJSON.Feature) => feature.properties.firstCoordTouchesPerimeter
        ),

        chosenStartPoint = sampleFromList(potentialStartLines);

    logger.debug({chosenStartPoint}, 'Found potential start lines');

    // TODO use turf-bezier to smooth out the line?
    const riverLines = generateRiverRec(chosenStartPoint, allRiverEdges.features),
        riverLineString = turfLineString(
            _(riverLines)
                .map((riverLine: GeoJSON.Feature) => riverLine.geometry.coordinates)
                .uniq()
                .flatten()
                .value()
        );

    logger.debug({riverLineString}, 'Generated river');

    return turfFeatureCollection(
        [riverLineString]
            .concat(debugPoints.features)
            .concat(opts.river.debug.includeVoronoiLinesInOutput ? allRiverEdges.features : [])
    );
}

export = generateRiver;
