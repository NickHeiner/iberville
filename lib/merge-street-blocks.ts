import logger = require('../util/logger/index');
import logStep = require('../util/logger/log-step');
import createPRNGUtils = require('./create-prng-utils');

const Alea = require('alea'),
    _ = require('lodash'),
    turfIntersect = require('turf-intersect'),
    turfFeatureCollection = require('turf-featurecollection'),
    turfMerge = require('turf-merge');

function mergeStreetBlocks(opts: IGenerateCityOpts, streetGrid: GeoJSON.FeatureCollection): GeoJSON.FeatureCollection {
    return logStep({featureLen: streetGrid.features.length, step: 'merging street blocks'}, () => {
        const pRNG = new Alea(opts.seed),
        pRNGUtils = createPRNGUtils(pRNG),

        // Controls how often a merge occurs.
        // 0 = always merge; 1 = never merge.
        // Range: [0, 1]
        mergeThreshold = 0;

        function removeDeep<T>(list: T[], toRemove: T): T[] {
            return _.reject(list, (elem: T) => _.isEqual(elem, toRemove));
        }

        function mergeStreetBlocksRec(
            alreadyVisited: GeoJSON.Feature[],
            toVisit: GeoJSON.Feature[]
        ): GeoJSON.Feature[] {
            
            if (!toVisit.length) {
                return alreadyVisited;
            }

            const considerMerging = _.head(toVisit),
                toVisitRest = _.tail(toVisit),

                intersectingBlocks: GeoJSON.Feature[] =
                    _.filter(toVisit, (block: GeoJSON.Feature) => turfIntersect(block, considerMerging));

            if (!intersectingBlocks.length) {
                return mergeStreetBlocksRec(alreadyVisited.concat([considerMerging]), toVisitRest);
            }

            const intersectingBlock = pRNGUtils.sampleFromList(intersectingBlocks),
                shouldMerge = pRNG() > mergeThreshold,
                newlyMergedBlock = shouldMerge ?
                    [turfMerge(turfFeatureCollection([considerMerging, intersectingBlock]))] :
                    [];

            logger.debug({intersectingBlock, considerMerging}, 'Merging blocks');

            return mergeStreetBlocksRec(
                alreadyVisited.concat(newlyMergedBlock),
                removeDeep(toVisitRest, intersectingBlock)
            );
        }

        return turfFeatureCollection(mergeStreetBlocksRec([], streetGrid.features));
    });
}

export = mergeStreetBlocks;
