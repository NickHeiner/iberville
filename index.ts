/// <reference path='./typings/tsd.d.ts' />

import getStreetGrid = require('./lib/get-street-grid');

import './types';

const qFs = require('q-io/fs'),
    _ = require('lodash'),
    q = require('q'),
    logger = require('./util/logger'),
    geoJsonHint = require('geojsonhint');

interface IGeoJsonFormatError extends Error {
    errors: [{
        message: string;
        line: number;
    }];
}

function createCity(rawOpts: ICreateCityOpts): Q.IPromise<void> {
    const opts = _.merge({}, {
            centerCoordinates: {
                lat: 0,
                long: 0
            },
            radius: .04,
            streetGrid: {
                noiseResolution: {
                    distance: .1,
                    units: 'miles'
                },
                noiseSubdivisionBaseThreshold: .00001
            },
            seed: 'default-seed'
        }, rawOpts),
        geoJson = getStreetGrid(_.omit(opts, 'outFileName')),
        errors = geoJsonHint.hint(geoJson);

    logger.info({geoJson: geoJson}, 'Produced geojson');

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

module.exports = createCity;
export = createCity;
