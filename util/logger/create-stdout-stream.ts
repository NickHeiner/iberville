'use strict';

const through2 = require('through2'),
    chalk = require('chalk'),
    bunyanFormat = require('bunyan-format'),
    stripAnsi = require('strip-ansi'),
    _ = require('lodash');

function createStdoutStream(out: NodeJS.WritableStream, logFormat: string) {
    const tapSafeLogOutput = through2((chunk: Buffer, enc: string, callback: Function) => {
            // All log records always end in a newline, so we want to strip
            // it off pre-prefixing and add it back afterwards.
            const lines = stripAnsi(chunk.toString()).trim().split('\n'),
                prefixedLines = _.map(lines, function(line: string) {
                        return '# ' + chalk.grey('LOG: ' + line);
                    }).join('\n') + '\n';

            callback(null, prefixedLines);
        }),
        outputStream = process.env.TAP === '1' ? tapSafeLogOutput : out,
        formattedStream = bunyanFormat({outputMode: logFormat}, outputStream);

    tapSafeLogOutput.pipe(out);

    return formattedStream;
}

export = createStdoutStream;
