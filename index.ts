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
    const opts = _.merge({}, defaultOpts, rawOpts),
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
        logger.info({errFileName: opts.errFileName}, 'Writing invalid geojson for debugging');
        return qFs.write(opts.errFileName + '.geojson', JSON.stringify(geoJson, null, 2)).then(() => {
            const err = <IGeoJsonFormatError> new Error('Bug: invalid GeoJson was produced');
            err.errors = errors;
            throw err;
        });
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
