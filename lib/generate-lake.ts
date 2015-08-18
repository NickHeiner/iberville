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
        perlinNoisePoints = _.map(
            pointGrid.features,
            (point: GeoJSON.Feature) => ({
                point: point,
                noise: perlin.noise.perlin2.apply(perlin.noise, point.geometry.coordinates)
            })
        ),
        maxNoisePoint: INoisePoint = _.max(perlinNoisePoints, 'noise'),
        nonMaxPoints: INoisePoint[] = _.reject(perlinNoisePoints, {noise: maxNoisePoint}),
        lowerThreshold = maxNoisePoint.noise * .5;

    logger.warn({lowerThreshold, maxNoisePoint}, 'Preparing to grow lake');

    function growLake(lakePoints: INoisePoint[], possiblePoints: INoisePoint[]): INoisePoint[] {
        if (!possiblePoints.length) {
            return lakePoints;
        }

        const distances = _(possiblePoints)
            .countBy(({point}: INoisePoint) => turfDistance(point, lakePoints[0].point))
            .value();

        logger.warn({distances}, 'found distances');

        return lakePoints;
    }

    return turfFeatureCollection(_.map(growLake([maxNoisePoint], nonMaxPoints), 'point'));
}

export = generateLake;
