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

            minimumBlockSizeKilometers: .1,
            maxBlockSizeKilometers: 4,

            annotate: {
                parks: {
                    // Identifying street grids to be parks works, but it's too slow for large data sets,
                    // so we provide an option to just disable it.
                    enable: false
                }
            },

            perturb: {
                enabled: true,

                // Start with a base amount to perturb by
                base: {
                    lat: .0005,
                    long: 0
                },

                // We want the perturbation amount to be relative to the overall size.
                // This makes it look more realistic. If we try to do a one-size-fits-all
                // approach, then the largest polys may be only trivially perturbed
                // relative to their size, and the smallest polys may be totally distorted.
                perturbAreaCoefficient: .00012,

                // Increase this value to make street be perturbed less often.
                // 0 = always perturb; 1 = never perturb.
                // Range: [0, 1]
                shouldPerturbThreshold: .5,

                shouldPerturbThresholdForSmallestBlocks: .9
            },

            mergeStreetBlocks: {
                enabled: true,

                // Controls how often a merge occurs.
                // 0 = always merge; 1 = never merge.
                // If there are two blocks next to each other, they have two chances to merge,
                // so you'll see a lot of merged blocks unless this value is relatively high.
                // Range: [0, 1]
                mergeThreshold: .75
            },

            // To save time for the demo, we will add some smoke and mirrors.
            // Note that this is coupled to the seed; if you change the seed, then
            // the id values in this object will have totally different meanings
            // and you'll get unexpected results.
            magic: {
                'street-block-2140': {
                    park: true
                },
                'street-block-2137': {
                    park: true,
                    parkName: 'Bryant Park'
                },
                'street-block-806': {
                    park: true,
                    parkName: 'Hudson Park'
                },
                'street-block-4739': {
                    park: true,
                    parkName: 'Lakefront Park'
                },
                'street-block-4740': {
                    park: true
                },
                'street-block-1311': {
                    park: true,
                    parkName: 'Willowbrook Park'
                },
                'street-block-1934': {
                    park: true,
                },
                'street-block-3955': {
                    park: true
                },
            }
        },
        removeIntersectingElements: true,
        seed: 'default-seed',
    };

export = defaults;
