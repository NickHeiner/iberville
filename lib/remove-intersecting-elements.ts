const turfFeatureCollection = require('turf-featurecollection'),
    turfIntersect = require('turf-intersect'),
    _ = require('lodash');

function removeIntersectingElements(elements: GeoJSON.FeatureCollection[]): GeoJSON.FeatureCollection {

    const features = _(elements)
        .map((featureCollection: GeoJSON.FeatureCollection, index: number, elements: GeoJSON.FeatureCollection[]) => {
            const higherPriorityFeatures = _(elements.slice(index))
                .map('features')
                .flatten()
                .value();

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
