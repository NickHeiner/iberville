import '../types';
import generateVoronoi = require('./generate-voronoi');

function generateRiver(opts: IGenerateCityOpts): GeoJSON.FeatureCollection {
    const potentialRiverEdges = generateVoronoi(opts);
    return potentialRiverEdges;
}

export = generateRiver;
