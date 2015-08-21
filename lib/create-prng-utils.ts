const _ = require('lodash');

function init(pRNG: () => number) {
    function sampleFromList<T>(list: T[]): T {
        const randomIndex = Math.floor(pRNG() * list.length),
            listClone = _.cloneDeep(list),
            sampledElement = _.pullAt(listClone, randomIndex)[0];

        return sampledElement;
    }

    function getScalingFactor() {
        return pRNG() * 2 - 1;
    }

    return {
        sampleFromList,
        getScalingFactor
    };
}

export = init;
