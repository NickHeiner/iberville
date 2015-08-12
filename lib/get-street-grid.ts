import '../types';
import logger = require('../util/logger/index');
import increaseGridDensity = require('./increase-grid-density');

const turfBboxPolygon = require('turf-bbox-polygon'),
    turfArea = require('turf-area'),
    _ = require('lodash');

function getStreetGrid(opts: IGenerateCityOpts): GeoJSON.FeatureCollection {
    const extent = [
            opts.centerCoordinates.lat - opts.radius,
            opts.centerCoordinates.long - opts.radius,
            opts.centerCoordinates.lat + opts.radius,
            opts.centerCoordinates.long + opts.radius,
        ],
        grid = increaseGridDensity(turfBboxPolygon(extent), opts),
        maxBlockSizeMeters = opts.streetGrid.maxBlockSizeKilometers * 1000,
        featuresWithoutLargeBlocks = _.reject(
            grid.features,
            (feature: GeoJSON.Feature) => {
                const areaMeters = turfArea(feature),
                    isBlockTooBig = areaMeters > maxBlockSizeMeters;

                logger.debug({
                    blockAreaMeters: areaMeters,
                    maxBlockSizeMeters: maxBlockSizeMeters,
                    isBlockTooBig: isBlockTooBig
                }, 'Rejecting block if it is too big');

                return isBlockTooBig;
            }
        );

    grid.features = featuresWithoutLargeBlocks;

    return grid;
}

export = getStreetGrid;
