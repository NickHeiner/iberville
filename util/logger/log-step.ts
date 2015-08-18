import logger = require('./index');

const _ = require('lodash'),
    moment = require('moment');

interface ILogStepOpts extends Object {
    loglevel?: string;
    step: string;
}

function logStep<T>(opts: ILogStepOpts, fn: () => T): T {
    const loglevel = opts.loglevel || 'info',
        logReadyOpts = _.omit(opts, ['loglevel', 'step']);

    logger[loglevel](logReadyOpts, 'Starting ' + opts.step);
    const startTime = moment(),
        result = fn(),
        durationSeconds = moment().diff(startTime, 'seconds', true);

    logger[loglevel](_.merge(logReadyOpts, {durationSeconds}), 'Completed ' + opts.step);

    return result;
}

export = logStep;
