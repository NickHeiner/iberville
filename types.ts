interface IGenerateCityOpts {
    centerCoordinates: {
        lat: number;
        long: number;
    };
    radius: number;
    seed: string;
    river: {
        enable: boolean;
        count: number;
        // TODO add forking factor?
        voronoiPointCount: number;
        debug: {
            includeVoronoiPointsInOutput: boolean;
        }
    };
    streetGrid: {
        enable: boolean;
        noiseResolution: {
            distance: number;
            units: string;
        }
        noiseSubdivisionBaseThreshold: number;
        noiseSubdivisionThresholdCoefficient: number;
        noiseThresholdDistanceFromCenterCoefficient: number;
        minimumBlockSizeKilometers: number;
        maxBlockSizeKilometers: number;
        noiseCoordinatesCoefficient: number;
    };
}

interface ICreateCityOpts extends IGenerateCityOpts {
    outFileName: string;
}
