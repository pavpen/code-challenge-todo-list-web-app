/**
 * Convenience subject for asserting about a collections of
 * methods on an object.
 */
export class MethodColectionSubject {
    constructor(
        public readonly receiver: { [key: string]: jest.MockedFunction<any> },
        public readonly methodNames: Array<string>) { }

    except(...methodNamesToExclude: Array<string>): MethodColectionSubject {
        const exclude = new Set(methodNamesToExclude);

        return new MethodColectionSubject(
            this.receiver,
            this.methodNames.filter(n => !exclude.has(n)));
    }

    forEach(processor: (method: jest.MockedFn<any>, methodName: string) => void) {
        for (const methodName of this.methodNames) {
            const method = this.receiver[methodName];

            processor(method, methodName);
        }
    }
}

export function allMockMethodsOfInstance(receiver: { [key: string]: any }): MethodColectionSubject {
    const methodNames: Array<string> = [];

    for (const name in receiver) {
        const member = receiver[name];

        if (typeof member === 'function' &&
            Object.hasOwn(member, 'mock')
        ) {
            methodNames.push(name);
        }

    }

    return new MethodColectionSubject(receiver, methodNames);
}