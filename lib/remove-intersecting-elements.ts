import logger = require('../util/logger/index');

const turfFeatureCollection = require('turf-featurecollection'),
    turfIntersect = require('turf-intersect'),
    _ = require('lodash');

function removeIntersectingElements(
    opts: IGenerateCityOpts,
    elements: GeoJSON.FeatureCollection[]
): GeoJSON.FeatureCollection {

    if (!opts.removeIntersectingElements) {
        logger.debug('Skipping removing intersecting elements because opts.removeIntersectingElements == false');
    }

    const features = _(elements)
        .map((featureCollection: GeoJSON.FeatureCollection, index: number, elements: GeoJSON.FeatureCollection[]) => {
            const higherPriorityFeatures = _(elements.slice(index + 1))
                .map('features')
                .flatten()
                .value();

            logger.trace({lenHigherPriorityFeatures: higherPriorityFeatures.length}, 'Found higher priority features');

            return _.reject(
                featureCollection.features,
                (feature: GeoJSON.Feature) =>
                    _.any(
                        higherPriorityFeatures,
                        (higherPriorityFeature: GeoJSON.Feature) => turfIntersect(higherPriorityFeature, feature)
                    )
            );
        })
        .flatten()
        .value();

    return turfFeatureCollection(features);
}

export = removeIntersectingElements;
