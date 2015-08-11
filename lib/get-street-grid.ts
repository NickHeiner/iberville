import '../types';

const turfSquareGrid = require('turf-square-grid');

function getStreetGrid(opts: IGenerateCityOpts) {
    const extent = [
        opts.centerCoordinates.lat - opts.radius,
        opts.centerCoordinates.long - opts.radius,
        opts.centerCoordinates.lat + opts.radius,
        opts.centerCoordinates.long + opts.radius,
    ];

    return turfSquareGrid(extent, opts.blockSize.distance, opts.blockSize.units);
}

export = getStreetGrid;
