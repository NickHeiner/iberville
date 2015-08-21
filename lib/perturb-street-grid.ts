import logger = require('../util/logger/index');
import logStep = require('../util/logger/log-step');

const traverse = require('traverse'),
    Alea = require('alea'),
    _ = require('lodash');

function perturbStreetGrid(
    opts: IGenerateCityOpts,
    featureCollection: GeoJSON.FeatureCollection
): GeoJSON.FeatureCollection {

    return logStep({step: 'perturbing street grid', featureLen: featureCollection.features.length}, () => {
        const pRNG = new Alea(opts.seed),
            perturbAmount = {
                lat: .0005,
                long: 0
            },
            shouldPerturbThreshold = 0;

        return traverse(featureCollection).map(function(node: any) {
            if (this.key === 'coordinates' && this.parent.node.type === 'Polygon' && pRNG() > shouldPerturbThreshold) {
                logger.warn({
                    node: node
                }, 'Perturbing node');
                const coordsClone = <number[][][]> _.cloneDeep(node);
                coordsClone[0][1][0] += perturbAmount.lat;
                coordsClone[0][1][1] += perturbAmount.long;
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
