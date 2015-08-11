interface IGenerateCityOpts {
    centerCoordinates: {
        lat: number;
        long: number;
    };
    radius: number;
    seed: string;
    streetGrid: {
        noiseResolution: {
            distance: number;
            units: string;
        }
        noiseSubdivisionBaseThreshold: number;
    };
}

interface ICreateCityOpts extends IGenerateCityOpts {
    outFileName: string;
}
