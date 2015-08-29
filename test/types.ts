interface IT {
    plan: (count: number) => void;
    test: (name: string, testFn: (t: IT) => void) => void;
    equal: (a: any, b: any, message: string) => void;
    deepEqual: (a: any, b: any, message: string) => void;
}
