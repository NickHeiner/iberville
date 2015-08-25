import '../types';
import logger = require('../util/logger/index');
import increaseGridDensity = require('./increase-grid-density');
import mergeStreetBlocks = require('./merge-street-blocks');
import perturbStreetGrid = require('./perturb-street-grid');

const turfBboxPolygon = require('turf-bbox-polygon'),
    turfArea = require('turf-area'),
    turfFeatureCollection = require('turf-featurecollection'),
    _ = require('lodash');

function getStreetGrid(opts: IGenerateCityOpts): GeoJSON.FeatureCollection {

    if (!opts.streetGrid.enable) {
        logger.warn('Skipping street grid generation because opts.streetGrid.enable = false');
        return turfFeatureCollection([]);
    }

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

    return perturbStreetGrid(opts, mergeStreetBlocks(opts, grid));
}

export = getStreetGrid;
