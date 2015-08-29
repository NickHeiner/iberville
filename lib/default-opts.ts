const defaults: IGenerateCityOpts = {
        centerCoordinates: {
            lat: 0,
            long: 0
        },
        // TODO: Make this km so we can easily transpose the city around the world
        // and not need to tweak this value as well.
        // TODO: Many of these values make sense at a specific scale, but if you
        // change radius, they break. The values that break should be redefined
        // to be in terms of the radius.
        radius: .004,
        river: {
            enable: true,
            voronoiPointCount: 1000,
            debug: {
                includeVoronoiPointsInOutput: false,
                includeVoronoiLinesInOutput: false
            }
        },
        lake: {
            enable: true,
            noiseResolution: {
                distance: .007,
                units: 'kilometers',
            },
            noiseCoordinatesCoefficient: 1500,
            noiseLowerThresholdCoefficient: .5,
            debug: {
                includeNoisePointsInOutput: false,
                includeLakePointsInOutput: false,
                omitLake: false
            }
        },
        generateOsm: false,
        streetGrid: {
            enable: true,
            noiseResolution: {
                distance: .1,
                units: 'kilometers'
            },
            noiseCoordinatesCoefficient: 1000,

            // The noise is contained to [0, 1], so the max level of subdivision we can have is given by:
            //      1 = noiseSubdivisionBaseThreshold * subdivisionLevel * noiseSubdivisionThresholdCoefficient
            noiseSubdivisionBaseThreshold: .1,
            noiseSubdivisionThresholdCoefficient: 1.2,

            // Increasing this value makes blocks further away from the city center less likely to subdivide.
            noiseThresholdDistanceFromCenterCoefficient: 2.5,

            minimumBlockSizeKilometers: .2,
            maxBlockSizeKilometers: 4,

            perturb: {
                enabled: true
            },

            mergeStreetBlocks: {
                enabled: true,

                // Controls how often a merge occurs.
                // 0 = always merge; 1 = never merge.
                // If there are two blocks next to each other, they have two chances to merge,
                // so you'll see a lot of merged blocks unless this value is relatively high.
                // Range: [0, 1]
                mergeThreshold: .75
            }
        },
        removeIntersectingElements: true,
        seed: 'default-seed'
    };

export = defaults;
