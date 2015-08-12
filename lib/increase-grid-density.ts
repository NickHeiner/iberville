import logger = require('../util/logger/index');

const _ = require('lodash'),
    alea = require('alea'),
    simplexNoise = require('simplex-noise'),
    turfExtent = require('turf-extent'),
    turfPointGrid = require('turf-point-grid'),
    turfSquareGrid = require('turf-square-grid'),
    turfArea = require('turf-area'),
    turfFeatureCollection = require('turf-featurecollection');

function increaseGridDensity(basePoly: GeoJSON.Feature, opts: IGenerateCityOpts): GeoJSON.FeatureCollection {
    const pseudoRandomNumberGenerator = new alea(opts.seed),
        simplexNoiseGenerator = new simplexNoise(pseudoRandomNumberGenerator);

    function increaseGridDensityRec(poly: GeoJSON.Feature, subdivisionLevel: number): GeoJSON.FeatureCollection {
        const childLogger = logger.child({poly: poly});

        childLogger.warn('Increasing grid density');

        const polyAreaKm = turfArea(poly) / 1000;

        const unsubdividedPoly = turfFeatureCollection([poly]);
        if (polyAreaKm < opts.streetGrid.minimumBlockSizeKilometers) {
            childLogger.warn({
                polyAreaKm: polyAreaKm,
                minimumPolyArea: opts.streetGrid.minimumBlockSizeKilometers
            }, 'This poly will not be subdivided further because it is too small.');
            return unsubdividedPoly;
        }

        const extent = turfExtent(poly),
            pointsToCheckForNoise = turfPointGrid(
                extent,
                opts.streetGrid.noiseResolution.distance,
                opts.streetGrid.noiseResolution.units
            );

        childLogger.warn({pointsCount: pointsToCheckForNoise.features.length}, 'Checking points for noise');


        if (!pointsToCheckForNoise.features.length) {
            return unsubdividedPoly;
        }

        const noiseAverage =
            _(pointsToCheckForNoise.features)
                .map('geometry')
                .map('coordinates')
                .sum(function(coords: number[]) {
                    // The coords may all be very close together. It may be necessary to multiply by a scaling factor
                    // to see much of a difference.
                    return simplexNoiseGenerator.noise2D(coords[0], coords[1]);
                }) / pointsToCheckForNoise.features.length,

            noiseThreshold = opts.streetGrid.noiseSubdivisionBaseThreshold
                * subdivisionLevel
                * opts.streetGrid.noiseSubdivisionThresholdCoefficient,
            shouldSubdivide = noiseAverage > noiseThreshold;

        childLogger.warn({
            noiseAverage: noiseAverage,
            noiseThreshold: noiseThreshold,
            subdivisionLevel: subdivisionLevel,
            shouldSubdivide: shouldSubdivide
        }, 'Determined noise average');

        if (!shouldSubdivide) {
            return unsubdividedPoly;
        }

        const polyAreaMeters = turfArea(poly),
            // This assumes that the poly is a square.
            polySideLengthMeters = Math.sqrt(polyAreaMeters),
            polyRadiusMeters = polySideLengthMeters / 2,
            subdivided = turfSquareGrid(extent, polyRadiusMeters / 1000, 'kilometers'),
            recursivelySubdividedFeatures = _(subdivided.features)
                .map(function(subdividedPoly: GeoJSON.Feature): GeoJSON.FeatureCollection {
                    return increaseGridDensityRec(subdividedPoly, subdivisionLevel + 1);
                })
                .map('feature')
                .flatten()
                .value();

        childLogger.warn({
            subdividedIntoCount: recursivelySubdividedFeatures.length
        }, 'Subdivided poly into new features');

        return turfFeatureCollection(recursivelySubdividedFeatures);
    }

    return increaseGridDensityRec(basePoly, 1);
}

export = increaseGridDensity;
