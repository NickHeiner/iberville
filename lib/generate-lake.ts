import logger = require('../util/logger/index');

const _ = require('lodash'),
    perlin = require('perlin'),
    turfDistance = require('turf-distance'),
    turfPointGrid = require('turf-point-grid'),
    turfFeatureCollection = require('turf-featurecollection');

interface INoisePoint {
    point: GeoJSON.Feature;
    noise: number;
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
                    noise: {
                        value: noiseValue,
                        algorithm: 'perlin'
                    },
                    createdFor: 'lake'
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

    function growLake(lakePoints: INoisePoint[], possiblePoints: INoisePoint[]):
            {lake: GeoJSON.Feature[], nonLake: GeoJSON.Feature[]} {
        function toGeoJson(noisePoints: INoisePoint[]): GeoJSON.Feature[] {
            return _.map(noisePoints, 'point');
        }

        if (!possiblePoints.length) {
            return _.mapValues({lake: lakePoints, nonLake: possiblePoints}, toGeoJson);
        }

        const distances = _(possiblePoints)
            .countBy(({point}: INoisePoint) => turfDistance(point, lakePoints[0].point))
            .values()
            .uniq()
            .value();

        logger.warn({distances}, 'found distances');

        return _.mapValues({lake: lakePoints, nonLake: possiblePoints}, toGeoJson);
    }

    const {lake, nonLake} = growLake([maxNoisePoint], nonMaxPoints);

    return turfFeatureCollection(lake.concat(
        opts.lake.debug.includeNoisePointsInOutput ? nonLake : []
    ));
}

export = generateLake;
