import logger = require('../util/logger/index');
import logStep = require('../util/logger/log-step');

const Alea = require('alea'),
    _ = require('lodash'),
    turfIntersect = require('turf-intersect'),
    turfFeatureCollection = require('turf-featurecollection'),
    turfMerge = require('turf-merge');

function mergeStreetBlocks(opts: IGenerateCityOpts, streetGrid: GeoJSON.FeatureCollection): GeoJSON.FeatureCollection {
    return logStep({featureLen: streetGrid.features.length, step: 'merging street blocks'}, () => {

        if (!opts.streetGrid.mergeStreetBlocks.enabled) {
            logger.debug('Skipping merging street blocks because opts.streetGrid.mergeStreetBlocks.enabled = false.');
            return streetGrid;
        }

        const pRNG = new Alea(opts.seed);

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

                intersectingBlock: GeoJSON.Feature =
                    _.first(toVisit, (block: GeoJSON.Feature) => turfIntersect(block, considerMerging));

            if (!intersectingBlock) {
                return mergeStreetBlocksRec(alreadyVisited.concat([considerMerging]), toVisitRest);
            }

            const shouldMerge = pRNG() > opts.streetGrid.mergeStreetBlocks.mergeThreshold,
                mergedBlock = turfMerge(turfFeatureCollection([considerMerging, intersectingBlock])),
                visitedBlock = shouldMerge ? mergedBlock : considerMerging;

            mergedBlock.properties.merged = true;

            logger.debug({intersectingBlock, considerMerging}, 'Considering merging blocks');

            return mergeStreetBlocksRec(
                alreadyVisited.concat([visitedBlock]),
                removeDeep(toVisitRest, intersectingBlock)
            );
        }

        return turfFeatureCollection(mergeStreetBlocksRec([], streetGrid.features));
    });
}

export = mergeStreetBlocks;
