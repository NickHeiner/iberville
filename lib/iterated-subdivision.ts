const _ = require('lodash'),
    turfArea = require('turf-area'),
    turfCentroid = require('turf-centroid'),
    turfPolygon = require('turf-polygon');

interface IPolygon {
    type: string;
    coordinates: [[number]];
}

/**
 * Implemented the Iterated Subdivision algorithm from http://gram.cs.mcgill.ca/papers/rudzicz-08-iterated.pdf.
 *
 * @param basePolygon
 * @param maxArea   in square meters
 * @param minArea   in square meters
 * @returns {*|any|any}
 */
function iteratedSubdivison(basePolygon: IPolygon, maxArea, minArea) {
    function iteratedSubdivisionRec(oversizedPolygons, correctlySizedPolygons) {
        if (!oversizedPolygons.length) {
            return correctlySizedPolygons;
        }

        const oversizedPolygon = _.first(oversizedPolygons),
            bisectedPolygons = bisect(oversizedPolygon);

        const [oversizedBisectedPolygons, correctlySizedBisectedPolygons] = _.partition(bisectedPolygons, isOversized);

        return iteratedSubdivisionRec(
            _.rest(oversizedPolygons).concat(oversizedBisectedPolygons),
            correctlySizedPolygons.concat(correctlySizedBisectedPolygons)
        );
    }

    function bisect(polygon) {
        const centroidCoords = turfCentroid({
                type: 'Feature',
                properties: {},
                geometry: polygon
            }).features[1].geometry.coordinates,
            leftPolygon = turfPolygon([[
                polygon.coordinates[0][0],
                polygon.coordinates[0][1],
                [polygon.coordinates[0][1][0], centroidCoords.coordinates[0][0]]
            ]]);
    }

    function isOversized(polygon) {
        return turfArea(polygon) > maxArea;
    }

    return iteratedSubdivisionRec([basePolygon], []);
}

export = iteratedSubdivison;
