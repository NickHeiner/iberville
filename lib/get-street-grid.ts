import '../types';

function getStreetGrid(opts: IGenerateCityOpts) {
    return [{
        'type': 'Feature',
        'geometry': {
            'type': 'Point',
            'coordinates': [
                opts.centerCoordinates.lat,
                opts.centerCoordinates.long
            ]
        },
        'properties': {}
    }];
}

export = getStreetGrid;
