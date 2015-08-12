'use strict';

import createStdoutStream = require('./create-stdout-stream');
import config = require('../config/index');

const bunyan = require('bunyan'),
    chalk = require('chalk');

chalk.enabled = true;

const streams = [{
    name: 'stdout',
    stream: createStdoutStream(process.stdout, 'short'),
    level: config('loglevel')
}];

export = bunyan.createLogger({
    name: 'iberville',
    serializers: bunyan.stdSerializers,
    src: false,
    streams: streams
});

