import logger = require('../util/logger/index');

const _ = require('lodash'),
    perlin = require('perlin'),
    color = require('color'),
    turfDistance = require('turf-distance'),
    turfPointGrid = require('turf-point-grid'),
    turfFeatureCollection = require('turf-featurecollection');

interface INoisePoint {
    point: GeoJSON.Feature;
    noise: number;
}

interface INoisePointDistance extends INoisePoint {
    distance: number;
}

function generateLake(opts: IGenerateCityOpts): GeoJSON.FeatureCollection {
    perlin.noise.seed(perlin);

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
        lowerThreshold = maxNoisePoint.noise * .5;

    logger.warn({lowerThreshold, maxNoisePoint}, 'Preparing to grow lake');

    function toGeoJson(noisePoints: INoisePoint[]): GeoJSON.Feature[] {
        return _.map(noisePoints, 'point');
    }

    function growLake(lakePoints: INoisePoint[], possiblePoints: INoisePoint[]):
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

            return isCloseEnough && meetsNoiseThreshold;
        }

        const pointsByDistance =
                _(possiblePoints)
                    .map((noisePoint: INoisePoint) => {
                        const distance = _(lakePoints)
                            .map(({point}: INoisePoint) => turfDistance(noisePoint.point, point))
                            .min();

                        return _.merge({}, noisePoint, {distance});
                    })
                    .sortBy('distance'),
            newLakePoints = pointsByDistance
                .takeWhile(shouldAddToLake)
                .each(({point}: INoisePoint) => {
                    point.properties['marker-color'] = color('red').hexString();
                })
                .value(),
            nonLakePoints = pointsByDistance.dropWhile(shouldAddToLake).value();

        logger.warn({
            newLakePointsLen: newLakePoints.length, nonLakePointsLen: nonLakePoints.length
        }, 'Identified which points can be added to the lake');

        if (!newLakePoints.length) {
            return {lake: lakePoints, nonLake: possiblePoints};
        }

        return growLake(newLakePoints.concat(lakePoints), nonLakePoints);
    }

    const {lake, nonLake} = _.mapValues(growLake([maxNoisePoint], nonMaxPoints), toGeoJson);

    return turfFeatureCollection(lake.concat(
        opts.lake.debug.includeNoisePointsInOutput ? nonLake : []
    ));
}

export = generateLake;
