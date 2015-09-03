import logger = require('../util/logger/index');

const _ = require('lodash'),
    perlin = require('perlin'),
    Alea = require('alea'),
    assert = require('assert'),
    color = require('color'),
    turfDistance = require('turf-distance'),
    turfPolygon = require('turf-polygon'),
    turfPoint = require('turf-point'),
    turfPointGrid = require('turf-point-grid');

interface INoisePoint {
    point: GeoJSON.Feature;
    noise: number;
}

interface INoisePointDistance extends INoisePoint {
    distance: number;
}

function generateLake(opts: IGenerateCityOpts): GeoJSON.Feature[] {

    if (!opts.lake.enable) {
        return [];
    }

    // TODO consider factoring creation of pRNG out so it is consistent.
    const pRNG = new Alea(opts.seed);
    perlin.noise.seed(pRNG());

    const extent = [
            opts.centerCoordinates.lat - opts.radius,
            opts.centerCoordinates.long - opts.radius,
            opts.centerCoordinates.lat + opts.radius,
            opts.centerCoordinates.long + opts.radius,
        ],
        pointGrid = turfPointGrid(extent, opts.lake.noiseResolution.distance, opts.lake.noiseResolution.units),
        perlinNoisePoints =  _.map(
            pointGrid.features,
            (point: GeoJSON.Feature) => {
                const noiseValue = perlin.noise.perlin2(
                    point.geometry.coordinates[0] * opts.lake.noiseCoordinatesCoefficient,
                    point.geometry.coordinates[1] * opts.lake.noiseCoordinatesCoefficient
                );

                _.merge(point.properties, {
                    noise_value: noiseValue,
                    noise_algorithm: 'perlin',
                    createdFor: 'lake',
                    'marker-color': color('#fff').darken(1 - (noiseValue + 1) / 2).hexString()
                });

                return {
                    point: point,
                    noise: noiseValue
                };
            }
        ),
        maxNoisePoint: INoisePoint = _.max(perlinNoisePoints, 'noise'),
        nonMaxPoints: INoisePoint[] = _.reject(perlinNoisePoints, {noise: maxNoisePoint}),
        lowerThreshold = maxNoisePoint.noise * opts.lake.noiseLowerThresholdCoefficient;

    maxNoisePoint.point.properties.isMaxNoisePoint = true;

    logger.debug({lowerThreshold, maxNoisePoint}, 'Preparing to grow lake');

    function toGeoJson(noisePoints: INoisePoint[]): GeoJSON.Feature[] {
        return _.map(noisePoints, 'point');
    }

    function growLake(lakePoints: INoisePoint[], possiblePoints: INoisePoint[], iterationCount: number):
            {lake: INoisePoint[], nonLake: INoisePoint[]} {

        if (!possiblePoints.length) {
            return {lake: lakePoints, nonLake: possiblePoints};
        }

        function shouldAddToLake({distance, noise, point}: INoisePointDistance): boolean {
            const isCloseEnough = distance < opts.lake.noiseResolution.distance * 2,
                meetsNoiseThreshold = noise > lowerThreshold;

            // This is SO bad.
            _.merge(point.properties, {
                lakeSelection_isCloseEnough: isCloseEnough,
                lakeSelection_meetsNoiseThreshold: meetsNoiseThreshold
            });

            logger.trace({
                isCloseEnough,
                meetsNoiseThreshold,
                shouldAdd: isCloseEnough && meetsNoiseThreshold,
                noise
            }, 'Considering adding point');

            return isCloseEnough && meetsNoiseThreshold;
        }

        logger.trace({
            lakePointsLen: lakePoints.length,
            possiblePointsLen: possiblePoints.length
        }, 'Preparing to distinguish new lake points and non lake points');

        const {newLakePoints, nonLakePoints} =
            _.reduce(
                possiblePoints,
                (
                    {newLakePoints, nonLakePoints}: {newLakePoints: INoisePoint[], nonLakePoints: INoisePoint[]},
                    noisePoint: INoisePoint
                ) => {
                    const distance = _(lakePoints)
                            .map(({point}: INoisePoint) => turfDistance(noisePoint.point, point))
                            .min(),

                         noisePointDistance: INoisePointDistance = _.merge({}, noisePoint, {distance}),
                         shouldAddPointToLake = shouldAddToLake(noisePointDistance);

                    if (shouldAddPointToLake) {
                        noisePoint.point.properties.lakeIterationAdded = iterationCount;

                        return {newLakePoints: newLakePoints.concat([noisePoint]), nonLakePoints};
                    } else {
                        noisePoint.point.properties.lakeIterationsSkipped =
                            noisePoint.point.properties.lakeIterationsSkipped || [];
                        noisePoint.point.properties.lakeIterationsSkipped.push(iterationCount);

                        return {newLakePoints, nonLakePoints: nonLakePoints.concat([noisePoint])};
                    }

                }, {newLakePoints: [], nonLakePoints: []}
            );

        logger.debug({
            newLakePointsLen: newLakePoints.length, nonLakePointsLen: nonLakePoints.length
        }, 'Identified which points can be added to the lake');

        if (!newLakePoints.length) {
            return {lake: lakePoints, nonLake: possiblePoints};
        }

        return growLake(newLakePoints.concat(lakePoints), nonLakePoints, iterationCount + 1);
    }

    if (opts.lake.debug.includeNoisePointsInOutput && opts.lake.debug.omitLake) {
        return _.map([maxNoisePoint].concat(nonMaxPoints), 'point');
    }

    const {lake, nonLake} = _.mapValues(growLake([maxNoisePoint], nonMaxPoints, 0), toGeoJson),
        lakePerimeter = _(lake)
            .filter((point: GeoJSON.Feature): boolean => {
                const uniqDistances = _(lake)
                    .map((otherPoint: GeoJSON.Point): number => turfDistance(point, otherPoint))
                    .filter((distance: number) => distance < opts.lake.noiseResolution.distance + 1e-5)
                    .value()
                    .length;

                // tisk tisk
                point.properties.uniqueDistances = uniqDistances;

                return uniqDistances < 5;
            })
            .map('geometry')
            .map('coordinates')
            .value();

    function getOrderedLakePerimeter(sortedPoints: number[][], unsortedPoints: number[][]): number[][] {
        if (!unsortedPoints.length) {
            return sortedPoints.concat([_.head(sortedPoints)]);
        }

        if (!sortedPoints.length) {
            return getOrderedLakePerimeter([_.head(unsortedPoints)], _.tail(unsortedPoints));
        }

        const mostRecentlyAddedPoint: number[] = _.last(sortedPoints),
            closestUnsortedPoint = _(unsortedPoints)
                .sortBy((point: number[]) => turfDistance(turfPoint(point), turfPoint(mostRecentlyAddedPoint)))
                .first(),
            unsortedPointsWithoutClosest =
                _.reject(unsortedPoints, (point: number[]) => _.isEqual(point, closestUnsortedPoint));

        assert(
            unsortedPoints.length === unsortedPointsWithoutClosest.length + 1,
            'removing the closest point should have only removed a single element from the list'
        );

        return getOrderedLakePerimeter(sortedPoints.concat([closestUnsortedPoint]), unsortedPointsWithoutClosest);
    }

    const orderedLakePerimeter = getOrderedLakePerimeter([], lakePerimeter);

    logger.debug({orderedLakePerimeter}, 'producted lake perimeter');

    const lakeHull: GeoJSON.Feature = turfPolygon([orderedLakePerimeter]);

    assert(lakeHull, 'Invalid parameters passed to turfConcave; lakeHull was undefined.');
    logger.debug({lakeHull}, 'produced lake hull');

    _.each(lake, (point: GeoJSON.Feature) => {
        point.properties['marker-color'] = color('red').hexString();
        point.properties.chosenForLake = true;
    });

    return []
        .concat(opts.lake.debug.omitLake ? [] : lakeHull)
        .concat(opts.lake.debug.includeNoisePointsInOutput ? nonLake : [])
        .concat(opts.lake.debug.includeLakePointsInOutput ? lake : []);
}

export = generateLake;
