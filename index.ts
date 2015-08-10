/// <reference path='./typings/tsd.d.ts' />

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
            'type': 'FeatureCollection',
                'features': [
                    { 'type': 'Feature',
                        'geometry': {'type': 'Point', 'coordinates': [102.0, 0.5]},
                        'properties': {'prop0': 'value0'}
                    },
                    { 'type': 'Feature',
                        'geometry': {
                            'type': 'LineString',
                            'coordinates': [
                                [102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]
                            ]
                        },
                        'properties': {
                            'prop0': 'value0',
                            'prop1': 0.0
                        }
                    },
                    { 'type': 'Feature',
                        'geometry': {
                            'type': 'Polygon',
                            'coordinates': [
                                [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
                                    [100.0, 1.0], [100.0, 0.0] ]
                            ]
                        },
                        'properties': {
                            'prop0': 'value0',
                            'prop1': {'this': 'that'}
                        }
                    }
                ]
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
