import '../types';
import increaseGridDensity = require('./increase-grid-density');

const turfBboxPolygon = require('turf-bbox-polygon');

function getStreetGrid(opts: IGenerateCityOpts): GeoJSON.FeatureCollection {
    const extent = [
            opts.centerCoordinates.lat - opts.radius,
            opts.centerCoordinates.long - opts.radius,
            opts.centerCoordinates.lat + opts.radius,
            opts.centerCoordinates.long + opts.radius,
        ];

    return increaseGridDensity(turfBboxPolygon(extent), opts);
}

export = getStreetGrid;
