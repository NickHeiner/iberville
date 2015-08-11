interface IGenerateCityOpts {
    centerCoordinates: {
        lat: number;
        long: number;
    };
    radius: number;
    blockSize: {
        distance: number;
        units: string;
    };
}

interface ICreateCityOpts extends IGenerateCityOpts {
    outFileName: string;
}
