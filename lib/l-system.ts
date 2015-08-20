const _ = require('lodash');

// Maybe instead of strings we can use Enums for this.
function lSystem(axiom: string, productions: Object): ILSystem {

    function lSystemRec(previous: string) {
        const current = _.reduce(previous, (nextStateAcc: string, char: string) => {
            const production = _.get(productions, char, char);
            return nextStateAcc + production;
        }, '');

        return {
            nextStep: () => lSystemRec(current),
            current
        };
    }

    return {
        nextStep: () => lSystemRec(axiom),
        current: [axiom]
    };
}

export = lSystem;
