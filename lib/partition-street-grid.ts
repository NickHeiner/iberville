import logger = require('../util/logger/index');

const turfExtent = require('turf-extent'),
    turfSquareGrid = require('turf-square-grid'),
    turfIntersect = require('turf-intersect'),
    _ = require('lodash');

interface IPartitionedStreetGrid {
    [blockId: string]: GeoJSON.Feature[];
}

function partitionStreetGrid(streetGrid: GeoJSON.FeatureCollection):
        {partitions: IPartitionedStreetGrid, partitionGrid: GeoJSON.Feature[]} {
            
    const extent = turfExtent(streetGrid),
        partitionZones: GeoJSON.FeatureCollection = turfSquareGrid(extent, .1, 'kilometers'),
        blocksPerPartition = _.groupBy(
            streetGrid.features,
            (block: GeoJSON.Feature) =>
                _.findIndex(partitionZones, (partition: GeoJSON.Feature) => turfIntersect(partition, block))
            ),
        lenBlocksPerPartition = _.mapValues(blocksPerPartition, 'length');

    logger.warn({
        partitionZonesCount: partitionZones.features.length,
        lenBlocksPerPartition
    }, 'Created partition zones');

    return _.reduce(
        blocksPerPartition,
        (acc: IPartitionedStreetGrid, blocks: GeoJSON.Feature[], partitionIndex: number) => {
            const blockIndexPairs = _.map(blocks, (block: GeoJSON.Feature) => {
                const newObj: IPartitionedStreetGrid = {};
                newObj[block.properties.id] = blocks;
                return newObj;
            });

            return _.merge.apply(_, [{}].concat(acc).concat(blockIndexPairs));
        },
        {}
    );
}

export = partitionStreetGrid;
