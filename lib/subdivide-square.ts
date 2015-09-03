const turfExtent = require('turf-extent'),
    turfPolygon = require('turf-polygon'),
    _ = require('lodash');

function subdivideSquare(square: GeoJSON.Feature, getProps: () => Object): GeoJSON.Feature[] {
    const [south, west, north, east]: number[] = turfExtent(square),
        nsLen = (north - south) / 2,
        ewLen = (east - west) / 2;

    function makeSquare(startX: number, startY: number): number[][][] {
        return [[
                [startX, startY],
                [startX, startY + ewLen],
                [startX + nsLen, startY + ewLen],
                [startX + nsLen, startY],
                [startX, startY]
            ]];
    }

    return _([
            [south, west],
            [south, west + ewLen],
            [south + nsLen, west + ewLen],
            [south + nsLen, west],
        ])
        .map(([startX, startY]: number[]) => makeSquare(startX, startY))
        .map((coords: number[][][]) => turfPolygon(coords, getProps()))
        .value();
}

export = subdivideSquare;
