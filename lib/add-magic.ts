import logger = require('../util/logger/index');
import logStep = require('../util/logger/log-step');

const traverse = require('traverse'),
    _ = require('lodash');

// I'm running out of time before the presentation, so let's add some smoke and mirrors
function addMagic(opts: IGenerateCityOpts, streetGrid: GeoJSON.FeatureCollection): GeoJSON.FeatureCollection {
    return logStep({step: 'adding magic', loglevel: 'debug'}, () =>
        traverse(streetGrid).map(function(node: any) {
            if (this.key === 'properties') {
                const mixin = opts.streetGrid.magic[node.id] || {};
                logger.trace({nodeId: node.id, mixin}, 'lookup block');
                this.update(_.merge({}, node, mixin), true);
            }
        })
    );
}

export = addMagic;
