function lSystem(axiom: string, productions: Object): ILSystem {
    let system: ILSystem;
    system = {
        nextStep: () => system,
        current: []
    };
    return system;
}

export = lSystem;
