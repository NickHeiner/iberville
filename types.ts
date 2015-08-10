interface IGenerateCityOpts {
    centerCoordinates: {
        lat: number;
        long: number;
    };
    radius: number;
}

interface ICreateCityOpts extends IGenerateCityOpts {
    outFileName: string;
}
