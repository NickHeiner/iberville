import logStep = require('../util/logger/log-step');

const _ = require('lodash'),
    traverse = require('traverse');

function sortCityBlocks(streetGrid: GeoJSON.FeatureCollection): GeoJSON.FeatureCollection {
    return logStep({step: 'sorting city blocks', featureLen: streetGrid.features.length}, () =>
        traverse(streetGrid).map(function(node: any) {
            if (this.key === 'features') {
                this.update(
                    _.sortByOrder(node, (feature: GeoJSON.Feature) => feature.properties.areaSqM, 'desc'),
                    true
                );
            }
        })
    );
}

export = sortCityBlocks;
