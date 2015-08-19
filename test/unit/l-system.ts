/// <reference path="../../typings/tsd.d.ts" />

import '../../types';
import lSystem = require('../../lib/l-system');

const tape = require('tape'),
    _ = require('lodash');

interface IT {
    plan: (count: number) => void;
    test: (name: string, testFn: (t: IT) => void) => void;
    equal: (a: any, b: any, message: string) => void;
}

tape('lSystem', function(t: IT) {
    t.test('fractal plant', function(t: IT) {
        t.plan(1);
        
        const plant = lSystem('X', {
                X: 'F−[[X]+X]+F[+FX]−X)',
                F: 'FF'
            }),
            {steps} = _(3)
                .range()
                .reduce(
                    (acc: {steps: string[][], system: ILSystem}) => ({
                        steps: acc.steps.concat(acc.system.current), 
                        system: acc.system.nextStep()
                    }), 
                    {steps: [], system: plant}
                );
                
        t.equal(steps[0], 'X', 'starts with axiom');
    });
});
