import logger = require('../util/logger/index');

const _ = require('lodash'),
    turfPolygon = require('turf-polygon');

// Is interface private to this module?
interface IRenderContext {
    features: GeoJSON.Feature[];
}

function renderStreetGridLSystem(opts: IGenerateCityOpts, seq: string[]): GeoJSON.Feature[] {
    logger.warn({seq}, 'Rendering l system');

    return _.reduce(seq, (renderContext: IRenderContext, char: string) => {
        let nextFeatures: GeoJSON.Feature[];

        switch (char) {
            case 'C':
                const cityCenterPoly = turfPolygon([[
                    [opts.centerCoordinates.lat + .0001, opts.centerCoordinates.long + .0001],
                    [opts.centerCoordinates.lat + .0001, opts.centerCoordinates.long - .0001],
                    [opts.centerCoordinates.lat - .0001, opts.centerCoordinates.long - .0001],
                    [opts.centerCoordinates.lat - .0001, opts.centerCoordinates.long + .0001],
                    [opts.centerCoordinates.lat + .0001, opts.centerCoordinates.long + .0001],
                ]]);
                nextFeatures = [cityCenterPoly];
                break;
            default:
                logger.warn({char}, 'renderStreetGridLSystem: unrecognized character.');
                nextFeatures = [];
        }

        return {
            features: renderContext.features.concat(nextFeatures)
        };

    }, {features: []}).features;
}

export = renderStreetGridLSystem;
