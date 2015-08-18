import logger = require('../util/logger/index');
import lSystem = require('./l-system');

const _ = require('lodash');

function getStreetGrid(opts: IGenerateCityOpts): GeoJSON.Feature[] {

    if (!opts.streetGrid.enable) {
        logger.warn('Skipping street grid generation because opts.streetGrid.enable = false');
        return [];
    }

    const axiom = 'C',
        productions = {
            C: 'CH',
            H: 'HH[S]',
        },
        stepCount = 3,
        streetGridLSystem = _(stepCount).range().reduce((acc: ILSystem) => acc.nextStep(), lSystem(axiom, productions));

    logger.warn({current: streetGridLSystem.current}, 'steps complete');

    return [];
}

export = getStreetGrid;
