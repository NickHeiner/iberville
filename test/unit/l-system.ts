/// <reference path="../../typings/tsd.d.ts" />

import '../../types';
import lSystem = require('../../lib/l-system');

const tape = require('tape');

interface IT {
    plan: (count: number) => void;
    test: (name: string, testFn: (t: IT) => void) => void;
    equal: (a: any, b: any, message: string) => void;
    deepEqual: (a: any, b: any, message: string) => void;
}

tape('lSystem', function(t: IT) {
    t.test('fractal plant', function(t: IT) {
        t.plan(1);
        
        const plant = lSystem('X', {
                X: 'F−[[X]+X]+F[+FX]−X)',
                F: 'FF'
            }),
            time0 = plant.current;
        
        t.deepEqual(time0, ['X'], 'starts with axiom');	
    });
});
