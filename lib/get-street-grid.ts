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
        baseGridPoly = turfBboxPolygon(extent);

    baseGridPoly.properties.streetBlock = true;

    // This could be extracted into its own file.
    function removeLargeBlocks(
        opts: IGenerateCityOpts,
        streetGrid: GeoJSON.FeatureCollection
    ): GeoJSON.FeatureCollection {

        const maxBlockSizeMeters = opts.streetGrid.maxBlockSizeKilometers * 1000;
        return turfFeatureCollection(_.reject(
            streetGrid.features,
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
        ));
    }

    return _.flow(
        _.partial(increaseGridDensity, opts),
        _.partial(removeLargeBlocks, opts),
        _.partial(mergeStreetBlocks, opts),
        _.partial(perturbStreetGrid, opts)
    )(baseGridPoly);
}

export = getStreetGrid;
