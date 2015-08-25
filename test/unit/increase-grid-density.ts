/// <reference path="../../typings/tsd.d.ts" />

import '../../types';
import '../types';
import logger = require('../../util/logger/index');
import increaseGridDensity = require('../../lib/increase-grid-density');
import defaultOpts = require('../../lib/default-opts');

const tape = require('tape'),
    turfPolygon = require('turf-polygon'),
    traverse = require('traverse'),
    _ = require('lodash');

tape('increaseGridDensity', function(t: IT) {
    t.test('create grid', function(t: IT) {
        t.plan(2);
        const opts = _.merge({}, defaultOpts, {
                streetGrid: {
                    noiseResolution: {
                        distance: 10,
                        units: 'kilometers'
                    },
                    noiseSubdivisionThresholdCoefficient: 100
                }
            }),
            basePoly = turfPolygon([[
                [-1, -1],
                [-1, 1],
                [1, 1],
                [1, -1],
                [-1, -1]
            ]]),
            streetGrid = increaseGridDensity(opts, basePoly);

        t.equal(streetGrid.features.length, 4, 'the base poly is subdivided once');

        const points = traverse(streetGrid).reduce(function(points: number[][], node: any): number[][] {
                if (this.key === 'coordinates') {
                    return points.concat(node[0]);
                }

                return points;
            }, []),
            uniquePoints = _.reduce(points, (allPoints: number[][], point: number[]) => {
                const pointAlreadyExists = _.any(
                    allPoints,
                    (alreadySeenPoint: number[]) => _.isEqual(point, alreadySeenPoint)
                );
                return pointAlreadyExists ? allPoints : allPoints.concat([point]);
            }, []);

        logger.debug({points, uniquePoints}, 'found unique points');

        t.equal(uniquePoints.length, 9, 'the whole grid has 9 unique points');
    });
});
