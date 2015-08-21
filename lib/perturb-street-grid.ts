import logger = require('../util/logger/index');
import logStep = require('../util/logger/log-step');

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
            // Start with a base amount to perturb by
            perturbAmount = {
                lat: .0005,
                long: 0
            },

            // We want the perturbation amount to be relative to the overall size.
            // This makes it look more realistic. If we try to do a one-size-fits-all
            // approach, then the largest polys may be only trivially perturbed
            // relative to their size, and the smallest polys may be totally distorted.
            perturbAreaCoefficient = .00012,

            // Increase this value to make street be perturbed less often.
            // 0 = always perturb; 1 = never perturb.
            // Range: [0, 1]
            shouldPerturbThreshold = .5;

        function getScalingFactor() {
            return pRNG() * 2 - 1;
        }

        const featureCollectionTraverse = traverse(featureCollection),
            pointsToTransform: IPointToTransform[] = featureCollectionTraverse
                .reduce(function(pointsToTransform: IPointToTransform[], node: any): IPointToTransform[] {
                    if (this.key === 'coordinates'
                        && this.parent.node.type === 'Polygon') {

                        logger.debug({
                            node: node
                        }, 'Adding node points to list of points to perturb');

                        const polyArea = turfArea(this.parent.node),
                            scaledPerturbAmounts = _.mapValues(
                                perturbAmount,
                                (amount: number) => amount * getScalingFactor() * polyArea * perturbAreaCoefficient
                            ),
                            // Always arbitrarily pick the 1st point for now.
                            // We may want to pick randomly in the future.
                            point = node[0][1],
                            previousPointToTransform = _(pointsToTransform)
                                .find(
                                    (pointToTransform: IPointToTransform) => {
                                        const isSamePoint = pointToTransform.point[0] === point[0] &&
                                            pointToTransform.point[1] === point[1];

                                        if (isSamePoint) {
                                            logger.warn({point}, 'same point found');
                                        }

                                        return isSamePoint;
                                    }
                                ),
                            previousTransform = previousPointToTransform ?
                                previousPointToTransform.transform :
                                {lat: Infinity, long: Infinity},
                            transformation = {
                                lat: Math.min(previousTransform.lat, scaledPerturbAmounts.lat),
                                long: Math.min(previousTransform.long, scaledPerturbAmounts.long),
                            };

                        if (previousPointToTransform) {
                            logger.warn('Duplicate found');
                        }

                        return pointsToTransform.concat([{point, transformation}]);
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
                .filter(() => pRNG() > shouldPerturbThreshold)
                .value();

        logger.debug({
            count: pointsToTransformSampled.length,
            unsampledCount: pointsToTransform.length
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
