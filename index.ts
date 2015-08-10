/// <reference path='./typings/tsd.d.ts' />

import getStreetGrid = require('./lib/get-street-grid');

const qFs = require('q-io/fs'),
    q = require('q'),
    logger = require('./util/logger'),
    geoJsonHint = require('geojsonhint');

interface ICreateCityOpts {
    outFileName: string;
}

interface IGeoJsonFormatError extends Error {
    errors: [{
        message: string;
        line: number;
    }];
}

function createCity(opts: ICreateCityOpts): Q.IPromise<void> {
    const geoJson = {
        type: 'FeatureCollection',
            features: getStreetGrid()
        },
        errors = geoJsonHint.hint(geoJson);

    if (errors.length) {
        const err = <IGeoJsonFormatError> new Error('Bug: invalid GeoJson was produced');
        err.errors = errors;
        const deferred = q.defer();
        deferred.reject(err);
        return deferred.promise;
    }

    logger.info({geoJson: geoJson}, 'Writing geojson');

    return qFs.write(opts.outFileName, JSON.stringify(geoJson, null, 2));
}

module.exports = createCity;
export = createCity;
