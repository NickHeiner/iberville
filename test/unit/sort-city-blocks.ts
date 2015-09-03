/// <reference path="../../typings/tsd.d.ts" />

import '../../types';
import '../types';
import sortCityBlocks = require('../../lib/sort-city-blocks');
import annotateStreetGrid = require('../../lib/annotate-street-grid');
import defaultOpts = require('../../lib/default-opts');

const tape = require('tape'),
    turfFeatureCollection = require('turf-featurecollection'),
    turfBboxPolygon = require('turf-bbox-polygon');

tape('sortCityBlocks', function(t: IT) {
    t.test('sorts city blocks', function(t: IT) {
        t.plan(2);

        const polys = [
                turfBboxPolygon([-20, -20, 20, 20]),
                turfBboxPolygon([-1, -1, 1, 1]),
                turfBboxPolygon([-3, -3, 3, 3]),
            ],
            features = turfFeatureCollection(polys),
            annotated = annotateStreetGrid(defaultOpts, features),
            sorted = sortCityBlocks(annotated);

        t.equal(
            true,
            sorted.features[0].properties.areaSqM >= sorted.features[1].properties.areaSqM,
            'first two polys are sorted correctly'
        );

        t.equal(
            true,
            sorted.features[1].properties.areaSqM >= sorted.features[2].properties.areaSqM,
            'last two polys are sorted correctly'
        );
    });
});

