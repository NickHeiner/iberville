interface IPresetMap {
    [presetName: string]: Object;
}

const presets: IPresetMap = {
    'stage-1': {
        river: {
            enable: false
        },
        lake: {
            enable: false
        },
        streetGrid: {
            noiseSubdivisionBaseThreshold: Infinity,
            maxBlockSizeKilometers: Infinity,
            perturb: {
                enabled: false
            },
            mergeStreetBlocks: {
                enabled: false
            }
        }
    },
    'stage-2': {
        river: {
            enable: false
        },
        lake: {
            enable: false
        },
        streetGrid: {
            noiseSubdivisionBaseThreshold: 0,
            minimumBlockSizeKilometers: 1,
            maxBlockSizeKilometers: Infinity,
            perturb: {
                enabled: false
            },
            mergeStreetBlocks: {
                enabled: false
            }
        }
    },
    'stage-3': {
        river: {
            enable: false
        },
        lake: {
            enable: false
        },
        streetGrid: {
            maxBlockSizeKilometers: Infinity,
            perturb: {
                enabled: false
            },
            mergeStreetBlocks: {
                enabled: false
            }
        }
    },
    'stage-4': {
        river: {
            enable: false
        },
        lake: {
            enable: false
        },
        streetGrid: {
            perturb: {
                enabled: false
            },
            mergeStreetBlocks: {
                enabled: false
            }
        }
    },
    'stage-5': {
        river: {
            enable: false
        },
        lake: {
            enable: false
        },
        streetGrid: {
            perturb: {
                enabled: false
            }
        }
    },
    'stage-6': {
        river: {
            enable: false
        },
        lake: {
            enable: false
        }
    },
    'stage-7': {
        lake: {
            enable: false
        }
    },
    'stage-8': {
        seed: 'a new lake'
    },
};

export = presets;
