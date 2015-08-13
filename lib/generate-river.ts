import '../types';
import generateVoronoi = require('./generate-voronoi');

function generateRiver(opts: IGenerateCityOpts): GeoJSON.FeatureCollection {
    return generateVoronoi(opts);
}

export = generateRiver;
