import logger = require('../util/logger/index');
import logStep = require('../util/logger/log-step');
import partitionStreetGrid = require('./partition-street-grid');

const traverse = require('traverse'),
    turfArea = require('turf-area'),
    _ = require('lodash');

function annotateStreetGrid(opts: IGenerateCityOpts, streetGrid: GeoJSON.FeatureCollection): GeoJSON.FeatureCollection {
    return logStep({step: 'annotating street grid'}, () => {
        const withArea: GeoJSON.FeatureCollection = traverse(streetGrid)
            .map(function(node: any) {
                if (this.key === 'properties') {
                    const poly = this.parent.node;
                    this.update(_.merge({}, node, {
                        areaSqM: turfArea(poly)
                    }), true);
                }
            }),
            {partitions, partitionGrid} = partitionStreetGrid(withArea);

        return traverse(withArea).map(function(node: any) {
                if (this.key === 'properties'
                    && node.generationDebugging_reasonStopped !== 'area below minimum block size') {

                    const neighbors = partitions[node.id],
                        averageNeighborAreaSqM = _(neighbors).map('properties').map('areaSqM').sum() / neighbors.length;

                    logger.warn({
                        averageNeighborAreaSqM,
                        streetBlockId: node.id,
                        countNeighbors: neighbors.length
                    }, 'Found average neighbor size.');

                    this.update(_.merge({}, node, {
                        averageNeighborAreaSqM,
                        countNeighborsFound: neighbors.length,
                        neighborAreaRatio: node.areaSqM / averageNeighborAreaSqM
                    }));
                }
            });
        });
}

export = annotateStreetGrid;
