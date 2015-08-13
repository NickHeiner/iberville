/// <reference path='./typings/tsd.d.ts' />

import createCity = require('./lib/create-city');

import './types';

const qFs = require('q-io/fs'),
    _ = require('lodash'),
    q = require('q'),
    logger = require('./util/logger'),
    moment = require('moment'),
    md5 = require('md5'),
    geoJsonHint = require('geojsonhint');

interface IGeoJsonFormatError extends Error {
    errors: [{
        message: string;
        line: number;
    }];
}

function iberville(rawOpts: ICreateCityOpts): Q.IPromise<void> {
    const startTime = moment(),
        defaults: IGenerateCityOpts = {
            centerCoordinates: {
                lat: 0,
                long: 0
            },
            // TODO: Make this km so we can easily transpose the city around the world
            // and not need to tweak this value as well.
            radius: .0015,
            river: {
                enable: true,
                voronoiPointCount: 300,
                count: 1,
                debug: {
                    includeVoronoiPointsInOutput: false
                }
            },
            streetGrid: {
                enable: true,
                noiseResolution: {
                    distance: .1,
                    units: 'kilometers'
                },
                noiseCoordinatesCoefficient: 1000,

                // The noise is contained to [0, 1], so the max level of subdivision we can have is given by:
                //      1 = noiseSubdivisionBaseThreshold * subdivisionLevel * noiseSubdivisionThresholdCoefficient
                noiseSubdivisionBaseThreshold: .1,
                noiseSubdivisionThresholdCoefficient: 1.2,
                noiseThresholdDistanceFromCenterCoefficient: 7,

                minimumBlockSizeKilometers: .1,
                maxBlockSizeKilometers: 1
            },
            seed: 'default-seed'
        },
        opts = _.merge({}, defaults, rawOpts),
        geoJson = createCity(_.omit(opts, 'outFileName')),
        errors = geoJsonHint.hint(geoJson),
        geoJsonHash = md5(JSON.stringify(geoJson));

    logger.warn({
        timeSeconds: moment().diff(startTime, 'seconds', true),
        countFeatures: geoJson.features.length,

        // This makes it easier to see if anything has changed. Without this, you have to copy/paste the output
        // and manually inspect in a geojson viewer.
        md5Checksum: geoJsonHash
    }, 'Geojson generation complete');

    logger.debug({geoJson: geoJson}, 'Produced geoJson');

    if (errors.length) {
        const err = <IGeoJsonFormatError> new Error('Bug: invalid GeoJson was produced');
        err.errors = errors;
        const deferred = q.defer();
        deferred.reject(err);
        return deferred.promise;
    }

    logger.info({outFile: opts.outFileName}, 'Writing geojson');

    return qFs.write(opts.outFileName, JSON.stringify(geoJson, null, 2));
}

module.exports = iberville;
