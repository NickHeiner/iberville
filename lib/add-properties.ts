const traverse = require('traverse'),
    _ = require('lodash');

function addProperties(features: GeoJSON.Feature[], props: Object): GeoJSON.FeatureCollection {
    return traverse(features).map(function(node: any) {
        if (this.key === 'properties') {
            this.update(_.merge({}, node, props), true);
        }
    });
}

export = addProperties;
