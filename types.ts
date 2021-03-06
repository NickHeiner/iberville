interface IGenerateCityOpts {
    centerCoordinates: {
        lat: number;
        long: number;
    };
    radius: number;
    seed: string;
    river: {
        enable: boolean;
        // TODO add forking factor and count?
        voronoiPointCount: number;
        debug: {
            includeVoronoiPointsInOutput: boolean;
            includeVoronoiLinesInOutput: boolean;
        }
    };
    lake: {
        enable: boolean;
        noiseResolution: {
            distance: number;
            units: string;
        },
        noiseCoordinatesCoefficient: number;
        noiseLowerThresholdCoefficient: number;
        debug: {
            includeNoisePointsInOutput: boolean;
            includeLakePointsInOutput: boolean;
            omitLake: boolean;
        }
    };
    generateOsm: boolean;
    streetGrid: {
        enable: boolean;
        noiseResolution: {
            distance: number;
            units: string;
        }
        annotate: {
            parks: {
                enable: boolean;
            }
        }
        noiseSubdivisionBaseThreshold: number;
        noiseSubdivisionThresholdCoefficient: number;
        noiseThresholdDistanceFromCenterCoefficient: number;
        minimumBlockSizeKilometers: number;
        maxBlockSizeKilometers: number;
        noiseCoordinatesCoefficient: number;
        perturb: {
            enabled: boolean;
            base: {
                lat: number;
                long: number;
            };
            perturbAreaCoefficient: number;
            shouldPerturbThreshold: number;
            shouldPerturbThresholdForSmallestBlocks: number;
        };
        mergeStreetBlocks: {
            enabled: boolean;
            mergeThreshold: number;
        }
        magic: {
            [blockId: string]: Object
        }
    };
    removeIntersectingElements: boolean;
}

interface ICreateCityOpts extends IGenerateCityOpts {
    outFileName: string;
    errFileName: string;
    presetName?: string;
}

interface ILSystem {
    nextStep: () => ILSystem;
    current: string[];
}

