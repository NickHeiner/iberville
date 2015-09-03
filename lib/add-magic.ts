const traverse = require('traverse');

// I'm running out of time before the presentation, so let's add some smoke and mirrors
function addMagic(opts: IGenerateCityOpts, streetGrid: GeoJSON.FeatureCollection): GeoJSON.FeatureCollection {
    return traverse(streetGrid).map(function(node: any) {
        if (this.key === 'properties') {
            const mixin = opts.streetGrid.magic[node.id] || {};
            this.update(node, mixin, true);
        }
    });
}

export = addMagic;
