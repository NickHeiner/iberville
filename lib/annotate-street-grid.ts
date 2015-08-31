const traverse = require('traverse'),
    turfArea = require('turf-area'),
    _ = require('lodash');

function annotateStreetGrid(opts: IGenerateCityOpts, streetGrid: GeoJSON.FeatureCollection): GeoJSON.FeatureCollection {
    return traverse(streetGrid).map(function(node: any) {
        if (this.key === 'properties') {
            const poly = this.parent.node;
            this.update(_.merge({}, node, {
                areaSqM: turfArea(poly)
            }), true);
        }
    });
}

export = annotateStreetGrid;
