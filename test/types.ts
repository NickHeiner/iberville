interface IT {
    plan: (count: number) => void;
    test: (name: string, testFn: (t: IT) => void) => void;
    equal: (actual: any, expected: any, message: string) => void;
    deepEqual: (actual: any, expected: any, message: string) => void;
}
