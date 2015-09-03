const _ = require('lodash'),
    traverse = require('traverse');

function isEqualFloat(a: any, b: any): boolean {
    if (!(_.isObject(a) && _.isObject(b))) {
        return _.isEqual(a, b);
    }

    function getLeafPaths(traverseObj: any) {
        return traverseObj.reduce(function(leafPaths: string[], node: any) {
            if (this.isLeaf) {
                return leafPaths.concat([this.path]);
            }

            return leafPaths;
        }, []);
    }

    const aTraverse = traverse(a),
        bTraverse = traverse(b),
        aPaths = getLeafPaths(aTraverse),
        bPaths = getLeafPaths(bTraverse);

    if (!_.isEqual(aPaths, bPaths)) {
        return false;
    }

    const threshold = 2e-9;
    return _.all(aPaths, (objPath: string): boolean => {
        const aVal = aTraverse.get(objPath),
            bVal = bTraverse.get(objPath);

        if (_.isFinite(aVal) && _.isFinite(bVal)) {
            return Math.abs(aVal - bVal) < threshold;
        }

        return _.isEqual(aVal, bVal);
    });
}

export = isEqualFloat;
