import createPRNGUtils = require('./create-prng-utils');

const Alea = require('alea'),
    _ = require('lodash'),
    turfIntersect = require('turf-intersect'),
    turfFeatureCollection = require('turf-featurecollection'),
    turfMerge = require('turf-merge');

function mergeStreetBlocks(opts: IGenerateCityOpts, streetGrid: GeoJSON.FeatureCollection): GeoJSON.FeatureCollection {
    const pRNG = new Alea(opts.seed),
        pRNGUtils = createPRNGUtils(pRNG),

        // Controls how often a merge occurs.
        // 0 = always merge; 1 = never merge.
        // Range: [0, 1]
        mergeThreshold = 0,

        mergedFeatures: GeoJSON.Feature[] =
            _.reduce(streetGrid, (merged: GeoJSON.Feature[], elBlock: GeoJSON.Feature, elIndex: number) => {
                const intersectingBlocks: GeoJSON.Feature[] = _(streetGrid)
                    .reject((ignored: any, index: number) => index === elIndex)
                    .filter((block: GeoJSON.Feature) => turfIntersect(block, elBlock))
                    .value(),

                    intersectingBlock = pRNGUtils.sampleFromList(intersectingBlocks),

                    shouldMerge = pRNG() > mergeThreshold,
                    newlyMergedBlocks = shouldMerge ? [turfMerge(elBlock, intersectingBlock)] : [];

                return merged.concat(newlyMergedBlocks);
            }, []);

    return turfFeatureCollection(mergedFeatures);
}

export = mergeStreetBlocks;