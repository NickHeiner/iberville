/// <reference path='./typings/tsd.d.ts' />

import createCity = require('./lib/create-city');
import logger = require('./util/logger/index');
import defaultOpts = require('./lib/default-opts');

import './types';

const qFs = require('q-io/fs'),
    osmAndGeojson = require('osm-and-geojson'),
    _ = require('lodash'),
    q = require('q'),
    md5 = require('md5'),
    geoJsonHint = require('geojsonhint');

interface IGeoJsonFormatError extends Error {
    errors: [{
        message: string;
        line: number;
    }];
}

function iberville(rawOpts: ICreateCityOpts): Q.IPromise<void> {
    // TODO Show how tweaking all these values changes the output.
    const opts = _.merge({}, defaultOpts, rawOpts, {
            lake: {enable: false},
            river: {enable: false},
            removeIntersectingElements: false,
            streetGrid: {
                minimumBlockSizeKilometers: .6,
                maxBlockSizeKilometers: Infinity,
                noiseSubdivisionBaseThreshold: .3,

                perturb: {enabled: false},
                mergeStreetBlocks: {enabled: false}
            }
        }),
        geoJson = createCity(_.omit(opts, 'outFileName')),
        errors = geoJsonHint.hint(geoJson),
        geoJsonHash = md5(JSON.stringify(geoJson));

    logger.warn({
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

    const fileWrites: Q.IPromise<void>[] = [];

    logger.info({outFile: opts.outFileName}, 'Writing geojson');
    fileWrites.push(qFs.write(opts.outFileName + '.geojson', JSON.stringify(geoJson, null, 2)));

    if (opts.generateOsm) {
        logger.info({outFile: opts.outFileName}, 'Writing osm');
        fileWrites.push(qFs.write(opts.outFileName + '.osm', osmAndGeojson.geojson2osm(geoJson)));
    }

    return q.all(fileWrites);
}

module.exports = iberville;
