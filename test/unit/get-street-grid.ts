/// <reference path="../../typings/tsd.d.ts" />

import '../../types';
import '../types';
import getStreetGrid = require('../../lib/get-street-grid');
import defaultOpts = require('../../lib/default-opts');

const tape = require('tape'),
    _ = require('lodash');

tape('getStreetGrid', function(t: IT) {
    t.test('sets area property', function(t: IT) {
        t.plan(2);

        const opts = _.merge({}, defaultOpts, {
                streetGrid: {
                    noiseSubdivisionThresholdCoefficient: 100,
                    maxBlockSizeKilometers: Infinity,
                }
            }),

            streetGrid = getStreetGrid(opts);

        t.equal(true, streetGrid.features.length > 0, 'some features are created');

        t.equal(
            true,
            _.all(streetGrid.features, (feature: GeoJSON.Feature) => _.isNumber(feature.properties.areaSqM)),
            'sets the area property on all features'
        );
    });
});
