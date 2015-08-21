import logger = require('../util/logger/index');
import logStep = require('../util/logger/log-step');

const traverse = require('traverse'),
    Alea = require('alea'),
    turfArea = require('turf-area'),
    _ = require('lodash');


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

            allPoints = featureCollectionTraverse.reduce(function(points: number[][], node: any): number[][] {
                if (this.key === 'coordinates' && this.parent.node.type === 'Polygon') {
                    return points.concat.apply(points, node);
                }

                return points;
            }, []),

            lats = _.map(allPoints, _.first),
            longs = _.map(allPoints, _.last),

            pointsToTransform: IPointToTransform[] = featureCollectionTraverse
                .reduce(function(pointsToTransform: IPointToTransform[], node: any): IPointToTransform[] {
                    if (this.key === 'coordinates'
                        && this.parent.node.type === 'Polygon'
                        && pRNG() > shouldPerturbThreshold) {

                        logger.debug({
                            node: node
                        }, 'Adding node points to list of points to perturb');

                        const polyArea = turfArea(this.parent.node),
                            scaledPerturbAmounts = _.mapValues(
                                perturbAmount,
                                (amount: number) => amount * getScalingFactor() * polyArea * perturbAreaCoefficient
                            );

                        // Always arbitrarily pick the 1st point for now.
                        // We may want to pick randomly in the future.
                        return pointsToTransform.concat([{
                            point: node[0][1],
                            transformation: scaledPerturbAmounts
                        }]);
                    }

                    logger.debug({
                        node,
                        self: {
                            key: this.key, parentType: this.parent && this.parent.node.type
                        }
                    }, 'Skipping node');

                    return pointsToTransform;
            }, []);

        logger.warn({
            latCount: lats.length,
            latUniqueCount: _.unique(lats).length,
            longCount: longs.length,
            longUniqueCount: _.unique(longs).length,
        }, 'found uniques');

        logger.warn({count: pointsToTransform.length}, 'Found points to transform');

        return featureCollectionTraverse.map(function(node: any) {
            const pointToTransform: IPointToTransform =
                _.find(pointsToTransform, ({point}: IPointToTransform) => _.isEqual(point, node));

            if (pointToTransform) {
                logger.debug(pointToTransform, 'Transforming point');
                this.update([
                    node[0] + pointToTransform.transformation.lat,
                    node[1] + pointToTransform.transformation.lat,
                ]);
            }
        });
    });
}

export = perturbStreetGrid;
