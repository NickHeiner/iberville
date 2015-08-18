import logger = require('../util/logger/index');

const LSystem = require('../vendor/l-system'),
    _ = require('lodash');

function getStreetGrid(opts: IGenerateCityOpts): GeoJSON.Feature[] {

    if (!opts.streetGrid.enable) {
        logger.warn('Skipping street grid generation because opts.streetGrid.enable = false');
        return [];
    }

    const axiom = 'CityCenter',
        productions = {
            CityCenter: 'B'
        },
        streetGridLSystem = new LSystem(axiom, productions);

    _.times(2, streetGridLSystem.step.bind(streetGridLSystem));

    logger.warn({current: streetGridLSystem.current}, 'steps complete');

    return [];
}

export = getStreetGrid;
