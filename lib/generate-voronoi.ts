import '../types';
import logger = require('../util/logger/index');

const Voronoi = require('voronoi'),
    _ = require('lodash'),
    Alea = require('alea'),
    turfFeatureCollection = require('turf-featurecollection'),
    turfPoint = require('turf-point'),
    turfLineString = require('turf-linestring');

interface IVoronoiVertex {
    x: number;
    y: number;
}

interface IVoronoiEdge {
    lSite?: IVoronoiVertex;
    rSite?: IVoronoiVertex;
    va: IVoronoiVertex;
    vb: IVoronoiVertex;
}

function generateVoronoi(opts: IGenerateCityOpts) {

    if (!opts.river.enable) {
        logger.debug('Skipping river generation because opts.river.enable = false');
        return turfFeatureCollection([]);
    }

    // TODO consider factoring creation of pRNG out so it is consistent.
    const pRNG = new Alea(opts.seed),
        bbox = {
            xl: opts.centerCoordinates.lat - opts.radius,
            xr: opts.centerCoordinates.lat + opts.radius,
            yt: opts.centerCoordinates.long - opts.radius,
            yb: opts.centerCoordinates.long + opts.radius,
        },
        bboxXLen = bbox.xr - bbox.xl,
        bboxYLen = bbox.yb - bbox.yt,
        sites = _(opts.river.voronoiPointCount)
            .range()
            .map(() => {
                const xRandom = pRNG(),
                    yRandom = pRNG();

                return {
                    x: bbox.xl + bboxXLen * xRandom,
                    y: bbox.yt + bboxYLen * yRandom
                };
            })
            .value();

    let voronoiPoints: GeoJSON.Feature[] = [];
    if (opts.river.debug.includeVoronoiPointsInOutput) {
        voronoiPoints = _.map(sites, (coord: IVoronoiVertex) => turfPoint([coord.x, coord.y]));
    }

    logger.debug({sites: sites, bbox: bbox}, 'Preparing to generate voronoi diagram');

    const voronoi = new Voronoi(),
        voronoiDiagram = voronoi.compute(sites, bbox);

    logger.warn({
        voronoiDiagramEdgesCount: voronoiDiagram.edges.length,
        voronoiDiagram: voronoiDiagram.edges
    }, 'Generated voronoi diagram');

    const lines = _(voronoiDiagram.edges)
        .filter('lSite')
        .filter('rSite')
        .map((edge: IVoronoiEdge) => turfLineString([[edge.va.x, edge.va.y], [edge.vb.x, edge.vb.y]], {river: true}))
        .value();

    return turfFeatureCollection(voronoiPoints.concat(lines));
}

export = generateVoronoi;
