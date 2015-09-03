/// <reference path="../../typings/tsd.d.ts" />

import '../../types';
import '../types';
import logger = require('../../util/logger/index');
import subdivideSquare = require('../../lib/subdivide-square');

const tape = require('tape'),
    _ = require('lodash'),
    turfFeatureCollection = require('turf-featurecollection'),
    geoJsonHint = require('geojsonhint'),
    turfPolygon = require('turf-polygon');

tape('subdivideSquare', (t: IT) => {
    t.test('subdivide square', (t: IT) => {
        t.plan(6);
        const basePoly = turfPolygon([[
                [-1, -1],
                [-1, 1],
                [1, 1],
                [1, -1],
                [-1, -1]
            ]]),
            subdivided = subdivideSquare(basePoly, _.noop),
            geoJsonErrors = geoJsonHint.hint(turfFeatureCollection(subdivided));

        logger.debug({subdivided}, 'got subdivided squares');

        t.deepEqual(geoJsonErrors, [], 'valid geojson is produced');

        t.equal(subdivided.length, 4, 'creates 4 sub squares');

        t.deepEqual(subdivided[0].geometry.coordinates, [[
            [-1, -1],
            [-1, 0],
            [0, 0],
            [0, -1],
            [-1, -1]
        ]], 'first square has correct coords');

        t.deepEqual(subdivided[1].geometry.coordinates, [[
            [-1, 0],
            [-1, 1],
            [0, 1],
            [0, 0],
            [-1, 0]
        ]], 'second square has correct coords');

        t.deepEqual(subdivided[2].geometry.coordinates, [[
            [0, 0],
            [0, 1],
            [1, 1],
            [1, 0],
            [0, 0]
        ]], 'third square has correct coords');

        t.deepEqual(subdivided[3].geometry.coordinates, [[
            [0, -1],
            [0, 0],
            [1, 0],
            [1, -1],
            [0, -1]
        ]], 'fourth square has correct coords');
    });

    t.test('subdivided square that does not have the same x and y coords for the starting point', (t: IT) => {
        t.plan(6);
        const basePoly = turfPolygon([[
                [-2, 1],
                [-2, 3],
                [0, 3],
                [0, 1],
                [-2, 1]
            ]]),
            subdivided = subdivideSquare(basePoly, _.noop),
            geoJsonErrors = geoJsonHint.hint(turfFeatureCollection(subdivided));

        logger.debug({subdivided}, 'got subdivided squares');

        t.deepEqual(geoJsonErrors, [], 'valid geojson is produced');

        t.equal(subdivided.length, 4, 'creates 4 sub squares');

        t.deepEqual(subdivided[0].geometry.coordinates, [[
            [-2, 1],
            [-2, 2],
            [-1, 2],
            [-1, 1],
            [-2, 1]
        ]], 'first square has correct coords');

        t.deepEqual(subdivided[1].geometry.coordinates, [[
            [-2, 2],
            [-2, 3],
            [-1, 3],
            [-1, 2],
            [-2, 2]
        ]], 'second square has correct coords');

        t.deepEqual(subdivided[2].geometry.coordinates, [[
            [-1, 2],
            [-1, 3],
            [0, 3],
            [0, 2],
            [-1, 2]
        ]], 'third square has correct coords');

        t.deepEqual(subdivided[3].geometry.coordinates, [[
            [-1, 1],
            [-1, 2],
            [0, 2],
            [0, 1],
            [-1, 1]
        ]], 'fourth square has correct coords');
    });
});
