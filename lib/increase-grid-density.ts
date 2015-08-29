import logger = require('../util/logger/index');
import subdivideSquare = require('./subdivide-square');

const _ = require('lodash'),
    alea = require('alea'),
    simplexNoise = require('simplex-noise'),
    turfExtent = require('turf-extent'),
    turfPointGrid = require('turf-point-grid'),
    turfPoint = require('turf-point'),
    turfArea = require('turf-area'),
    turfFeatureCollection = require('turf-featurecollection'),
    turfDistance = require('turf-distance'),
    turfCentroid = require('turf-centroid'),
    shortid = require('shortid');

function increaseGridDensity(opts: IGenerateCityOpts, basePoly: GeoJSON.Feature): GeoJSON.FeatureCollection {
    const pseudoRandomNumberGenerator = new alea(opts.seed),
        simplexNoiseGenerator = new simplexNoise(pseudoRandomNumberGenerator);

    function increaseGridDensityRec(poly: GeoJSON.Feature, subdivisionLevel: number): GeoJSON.FeatureCollection {
        const childLogger = logger.child({poly: poly});

        childLogger.debug('Increasing grid density');

        const polyAreaKm = turfArea(poly) / 1000;

        const unsubdividedPoly = turfFeatureCollection([poly]);
        if (polyAreaKm < opts.streetGrid.minimumBlockSizeKilometers) {
            // properties has to just be string/string key value pairs if it is to show up nicely in geojson.io.
            unsubdividedPoly.features[0].properties.generationDebugging_polyAreaKm = polyAreaKm;
            unsubdividedPoly.features[0].properties.generationDebugging_reasonStopped = 'area below minimum block size';
            childLogger.debug({
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

        childLogger.debug({pointsCount: pointsToCheckForNoise.features.length}, 'Checking points for noise');

        if (!pointsToCheckForNoise.features.length) {
            unsubdividedPoly.features[0].properties
                .generationDebugging_reasonStopped = 'no points in point grid to check for noise';
            return unsubdividedPoly;
        }

        const noiseAverage =
            _(pointsToCheckForNoise.features)
                .map('geometry')
                .map('coordinates')
                .sum((coords: number[]) => {
                    // The coords may all be very close together. It may be necessary to multiply by a scaling factor
                    // to see much of a difference.
                    const noiseValue = simplexNoiseGenerator.noise2D(
                        coords[0] * opts.streetGrid.noiseCoordinatesCoefficient,
                        coords[1] * opts.streetGrid.noiseCoordinatesCoefficient
                    ),
                        // The noise values are in the range [-1, 1], and we want to normalize that to [0, 1].
                        // Are those bounds inclusive or exclusive? I'm actually not sure.
                        normalizedNoiseValue = (noiseValue + 1) / 2;

                    return normalizedNoiseValue;
                }) / pointsToCheckForNoise.features.length,

            polyCentroidPoint = turfCentroid(unsubdividedPoly),
            distanceFromCenter = turfDistance(
                polyCentroidPoint,
                turfPoint([opts.centerCoordinates.long, opts.centerCoordinates.lat])
            ),

            // This has the (nice?) property that distance will be 0 for the first poly, so we will always
            // subdivide the first time, because the threshold will be 0, which is less than any noise value.
            distanceCoefficient = opts.streetGrid.noiseThresholdDistanceFromCenterCoefficient * distanceFromCenter,

            noiseThreshold = opts.streetGrid.noiseSubdivisionBaseThreshold
                * distanceCoefficient
                * subdivisionLevel
                * opts.streetGrid.noiseSubdivisionThresholdCoefficient,
            shouldSubdivide = noiseAverage > noiseThreshold;

        childLogger.debug({
            noiseAverage: noiseAverage,
            noiseThreshold: noiseThreshold,
            distance: distanceFromCenter,
            distanceCoefficient: distanceCoefficient,
            noiseSubdivisionThresholdCoefficient: opts.streetGrid.noiseSubdivisionThresholdCoefficient,
            subdivisionLevel: subdivisionLevel,
            shouldSubdivide: shouldSubdivide
        }, 'Determined noise average');

        if (!shouldSubdivide) {
            unsubdividedPoly.features[0].properties.generationDebugging_noiseAverage = noiseAverage;
            unsubdividedPoly.features[0].properties.generationDebugging_threshold = noiseThreshold;
            unsubdividedPoly.features[0].properties.generationDebugging_reasonStopped = 'noise below threshold';
            return unsubdividedPoly;
        }

        const subdivided = subdivideSquare(poly, () => ({id: shortid.generate()})),
            recursivelySubdividedFeatures = _(subdivided)
                .map(
                    (subdividedPoly: GeoJSON.Feature) =>
                        increaseGridDensityRec(subdividedPoly, subdivisionLevel + 1).features
                )
                .flatten()
                .value();

        childLogger.debug({
            subdividedIntoCount: recursivelySubdividedFeatures.length
        }, 'Subdivided poly into new features');

        return turfFeatureCollection(recursivelySubdividedFeatures);
    }

    return increaseGridDensityRec(basePoly, 1);
}

export = increaseGridDensity;
