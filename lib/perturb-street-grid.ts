import logger = require('../util/logger/index');
import logStep = require('../util/logger/log-step');

const traverse = require('traverse'),
    Alea = require('alea'),
    turfArea = require('turf-area'),
    _ = require('lodash');

function perturbStreetGrid(
    opts: IGenerateCityOpts,
    featureCollection: GeoJSON.FeatureCollection
): GeoJSON.FeatureCollection {

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

        return traverse(featureCollection).map(function(node: any) {
            if (this.key === 'coordinates' && this.parent.node.type === 'Polygon' && pRNG() > shouldPerturbThreshold) {
                logger.debug({
                    node: node
                }, 'Perturbing node');

                const polyArea = turfArea(this.parent.node),
                    scaledPerturbAmounts = _.mapValues(
                        perturbAmount,
                        (amount: number) => amount * getScalingFactor() * polyArea * perturbAreaCoefficient
                    ),
                    coordsClone = <number[][][]> _.cloneDeep(node);

                coordsClone[0][1][0] += scaledPerturbAmounts.lat;
                coordsClone[0][1][1] += scaledPerturbAmounts.long;

                this.update(coordsClone);
            } else {
                logger.debug({
                    node,
                    self: {
                        key: this.key, parentType: this.parent && this.parent.node.type
                    }
                }, 'Skipping node');
            }
        });
    });
}

export = perturbStreetGrid;
