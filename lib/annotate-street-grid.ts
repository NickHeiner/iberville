import logger = require('../util/logger/index');
import logStep = require('../util/logger/log-step');

const traverse = require('traverse'),
    turfArea = require('turf-area'),
    turfIntersect = require('turf-intersect'),
    turf = require('turf'),
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
            });

        return traverse(withArea).map(function(node: any) {
                if (this.key === 'properties'
                    && node.generationDebugging_reasonStopped !== 'area below minimum block size'
                    && opts.streetGrid.annotate.parks.enable) {

                    const expandedStreetBlock = turf.buffer(this.parent.node, .01, 'kilometers').features[0];

                    logger.debug({
                        expandedStreetBlock,
                        orig: this.parent.node
                    }, 'Expanded street block to find neighbors');

                    const neighbors = _(withArea.features)
                        .sample(Math.min(withArea.features.length, 200))
                        .reject((feature: GeoJSON.Feature): boolean => feature.properties.id === node.id)
                        .filter((feature: GeoJSON.Feature): boolean => {
                            try {
                                return turfIntersect(feature, expandedStreetBlock);
                            } catch (e) {
                                // *le sigh* https://github.com/Turfjs/turf-intersect/issues/11
                                logger.debug(e, 'Caught error on turf-intersect');
                                return false;
                            }
                        }),

                        averageNeighborAreaSqM = neighbors.map('properties').map('areaSqM').sum() / neighbors.size();

                    logger.debug({
                        averageNeighborAreaSqM,
                        streetBlockId: node.id,
                        countNeighbors: neighbors.size()
                    }, 'Found average neighbor size.');

                    this.update(_.merge({}, node, {
                        averageNeighborAreaSqM,
                        countNeighborsFound: neighbors.size(),
                        neighborAreaRatio: node.areaSqM / averageNeighborAreaSqM
                    }));
                }
            });
        });
}

export = annotateStreetGrid;
