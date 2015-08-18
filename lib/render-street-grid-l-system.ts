import logger = require('../util/logger/index');

const _ = require('lodash'),
    turfLinestring = require('turf-linestring'),
    turfPolygon = require('turf-polygon');

// Is interface private to this module?
interface IRenderContext {
    features: GeoJSON.Feature[];
    startPoint: number[];
}

function renderStreetGridLSystem(opts: IGenerateCityOpts, seq: string[]): GeoJSON.Feature[] {
    logger.warn({seq}, 'Rendering l system');

    return _.reduce(seq, (renderContext: IRenderContext, char: string) => {
        let nextFeatures: GeoJSON.Feature[],
            nextStartPoint: number[];

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
                nextStartPoint = [opts.centerCoordinates.lat, opts.centerCoordinates.long + .00005];
                break;

            case 'H':
                const highwayEndPoint = [renderContext.startPoint[0], renderContext.startPoint[1] + .0001];
                nextFeatures = [
                    turfLinestring([
                        renderContext.startPoint,
                        highwayEndPoint
                    ])
                ];
                nextStartPoint = highwayEndPoint;
                break;

            default:
                logger.warn({char}, 'renderStreetGridLSystem: unrecognized character.');
                nextFeatures = [];
                nextStartPoint = renderContext.startPoint;
        }

        return {
            features: renderContext.features.concat(nextFeatures),
            startPoint: nextStartPoint
        };

    }, {features: []}).features;
}

export = renderStreetGridLSystem;
