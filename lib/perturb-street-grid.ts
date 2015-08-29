import logger = require('../util/logger/index');
import logStep = require('../util/logger/log-step');
import createPRNGUtils = require('./create-prng-utils');

const traverse = require('traverse'),
    Alea = require('alea'),
    turfArea = require('turf-area'),
    _ = require('lodash'),
    assert = require('assert');

interface IPointToTransform {
    point: number[];
    transformation: {
        lat: number;
        long: number;
    };
    isSmallestBlock: boolean;
}

function perturbStreetGrid(
    opts: IGenerateCityOpts,
    featureCollection: GeoJSON.FeatureCollection
): GeoJSON.FeatureCollection {

    if (!opts.streetGrid.perturb.enabled) {
        logger.debug('Not perturbing street grid because enabled = false.');
        return featureCollection;
    }

    return logStep({step: 'perturbing street grid', featureLen: featureCollection.features.length}, () => {
        const pRNG = new Alea(opts.seed),
            pRNGUtils = createPRNGUtils(pRNG),

            featureCollectionTraverse = traverse(featureCollection),
            pointsToTransform: IPointToTransform[] = featureCollectionTraverse
                .reduce(function(pointsToTransform: IPointToTransform[], node: any): IPointToTransform[] {
                    if (this.key === 'coordinates'
                        && this.parent.node.type === 'Polygon') {

                        logger.debug({
                            node: node
                        }, 'Adding node points to list of points to perturb');

                        const polyArea = turfArea(this.parent.node),
                            scaledPerturbAmounts = _.mapValues(
                                opts.streetGrid.perturb.base,
                                (amount: number) => amount
                                    * pRNGUtils.getScalingFactor()
                                    * polyArea
                                    * opts.streetGrid.perturb.perturbAreaCoefficient
                            ),

                            // The first and last points of the poly have to be the same,
                            // so let's just leave them alone.
                            pointsToPerturb = node[0].slice(1, node[0].length - 1),

                            points: IPointToTransform[] = _.map(pointsToPerturb, ((point: number[]) => {
                                const previousPointToTransform: IPointToTransform = _(pointsToTransform)
                                    // TODO can we use _.where for this?
                                    .find(
                                        (pointToTransform: IPointToTransform) =>
                                            _.isEqual(pointToTransform.point, point)
                                    ),
                                previousTransform = previousPointToTransform ?
                                    previousPointToTransform.transformation :
                                    {lat: Infinity, long: Infinity};

                                logger.debug({previousTransform, previousPointToTransform});

                                const transformation = {
                                    lat: Math.min(previousTransform.lat, scaledPerturbAmounts.lat),
                                    long: Math.min(previousTransform.long, scaledPerturbAmounts.long),
                                };

                                return {
                                    point,
                                    transformation,
                                    isSmallestBlock: this.parent.parent
                                        .node.properties
                                        .generationDebugging_reasonStopped === 'area below minimum block size'
                                };
                            }));

                        return pointsToTransform.concat(points);

                    }

                    logger.debug({
                        node,
                        self: {
                            key: this.key, parentType: this.parent && this.parent.node.type
                        }
                    }, 'Skipping node');

                    return pointsToTransform;
            }, []),

            pointsToTransformSampled = _(pointsToTransform)
                // We need to sort first so we are always filtering the same way.
                .sortBy(({point}: IPointToTransform) => point[0])
                .sortBy(({point}: IPointToTransform) => point[1])
                .filter(({isSmallestBlock}: IPointToTransform) => {
                    const threshold =
                        isSmallestBlock ?
                            opts.streetGrid.perturb.shouldPerturbThresholdForSmallestBlocks :
                            opts.streetGrid.perturb.shouldPerturbThreshold;
                    return pRNG() > threshold;
                })
                .value();

        logger.debug({
            count: pointsToTransformSampled.length,
            unsampledCount: pointsToTransform.length,
        }, 'Found points to transform');

        assert(
            pointsToTransform.length >= pointsToTransformSampled.length,
            'There should not be more sampled points than there were non-sampled points'
        );

        return featureCollectionTraverse.map(function(node: any) {
            const pointToTransform: IPointToTransform =
                _.find(pointsToTransformSampled, ({point}: IPointToTransform) => _.isEqual(point, node));

            if (pointToTransform) {
                logger.debug(pointToTransform, 'Transforming point');
                this.update([
                    node[0] + pointToTransform.transformation.lat,
                    node[1] + pointToTransform.transformation.long,
                ]);
            }
        });
    });
}

export = perturbStreetGrid;
