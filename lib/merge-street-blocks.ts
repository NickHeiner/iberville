import logger = require('../util/logger/index');
import logStep = require('../util/logger/log-step');
import createPRNGUtils = require('./create-prng-utils');

const Alea = require('alea'),
    _ = require('lodash'),
    turfIntersect = require('turf-intersect'),
    turfFeatureCollection = require('turf-featurecollection'),
    turfMerge = require('turf-merge');

function takeAtMost<T>(list: T[], pred: ((elem: T) => boolean), count: number): T[] {
    function takeAtMostRec(list: T[], found: T[]): T[] {
        if (!list.length || found.length === count) {
            return found;
        }

        const head = _.head(list),
            tail = _.tail(list),
            addToFound = pred(head) ? [head] : [];

        return takeAtMostRec(tail, addToFound.concat(found));
    }

    return takeAtMostRec(list, []);
}

function mergeStreetBlocks(opts: IGenerateCityOpts, streetGrid: GeoJSON.FeatureCollection): GeoJSON.FeatureCollection {
    return logStep({featureLen: streetGrid.features.length, step: 'merging street blocks'}, () => {

        if (!opts.streetGrid.mergeStreetBlocks.enabled) {
            logger.debug('Skipping merging street blocks because opts.streetGrid.mergeStreetBlocks.enabled = false.');
            return streetGrid;
        }

        const pRNG = new Alea(opts.seed),
            pRNGUtils = createPRNGUtils(pRNG);

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

            const shouldMerge = pRNG() > opts.streetGrid.mergeStreetBlocks.mergeThreshold,
                considerMerging: GeoJSON.Feature = _.head(toVisit),
                toVisitRest: GeoJSON.Feature[] = _.tail(toVisit);

            if (!shouldMerge) {
                return mergeStreetBlocksRec(alreadyVisited.concat([considerMerging]), toVisitRest);
            }

            const intersectingBlocks = takeAtMost(toVisitRest, block => turfIntersect(block, considerMerging), 2);

            if (!intersectingBlocks.length) {
                return mergeStreetBlocksRec(alreadyVisited.concat([considerMerging]), toVisitRest);
            }

            const intersectingBlock = pRNGUtils.sampleFromList(intersectingBlocks),
                mergedBlock = turfMerge(turfFeatureCollection([considerMerging, intersectingBlock]));

            mergedBlock.properties.merged = true;

            logger.debug({intersectingBlock, considerMerging}, 'Considering merging blocks');

            return mergeStreetBlocksRec(
                alreadyVisited.concat([mergedBlock]),
                removeDeep(toVisitRest, intersectingBlock)
            );
        }

        return turfFeatureCollection(mergeStreetBlocksRec([], streetGrid.features));
    });
}

export = mergeStreetBlocks;
