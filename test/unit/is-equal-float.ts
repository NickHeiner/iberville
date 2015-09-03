/// <reference path="../../typings/tsd.d.ts" />

import '../../types';
import '../types';
import isEqualFloat = require('../../lib/is-equal-float');

const tape = require('tape');

tape('isEqualFloat', function(t: IT) {
    t.test('is equal – no floats', function(t: IT) {
        t.plan(1);

        t.equal(isEqualFloat({foo: 'bar'}, {foo: 'bar'}), true, 'two objects without floats are equivalent');
    });

    t.test('is not equal – no floats', function(t: IT) {
        t.plan(1);

        t.equal(isEqualFloat({foo: 'bar'}, {foo: 'asdf'}), false, 'two objects without floats are not equivalent');
    });

    t.test('is equal – floats', function(t: IT) {
        t.plan(1);

        t.equal(isEqualFloat({foo: .1}, {foo: .1 + 2e-10}), true, 'two objects with floats are equivalent');
    });

    t.test('is not equal – floats', function(t: IT) {
        t.plan(1);

        t.equal(isEqualFloat({foo: .1}, {foo: .1 + 2e-8}), false, 'two objects with floats not are equivalent');
    });

    t.test('is not equal - extraneous path', function(t: IT) {
        t.plan(1);

        t.equal(
            isEqualFloat({key: 'val'}, {key: 'val', extraneous: 'value'}),
            false,
            'objects with different keys are not equal'
        );
    });
});
