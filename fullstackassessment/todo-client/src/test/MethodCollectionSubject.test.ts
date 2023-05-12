import { allMockMethodsOfInstance } from "./MethodCollectionSubject";

describe('function allMockMethodsOfInstance', () => {
    test('Collects mock methods', () => {
        class TestMockClass {
            method1 = jest.fn();
            method2 = jest.fn();
            method3 = jest.fn();
        }

        const names = allMockMethodsOfInstance(new TestMockClass).methodNames;

        expect(names).toIncludeSameMembers(['method1', 'method2', 'method3']);
    });
    test('Skips non-mock methods', () => {
        class TestMockClass {
            nonMockProperty = 3;

            method1 = jest.fn();
            method2() { }
        }

        const names = allMockMethodsOfInstance(new TestMockClass).methodNames;

        expect(names).toEqual(['method1']);
    });
});

describe('Class MethodCollectionSubject', () => {
    describe('except', () => {
        test('excludes specified methods', () => {
            class TestMockClass {
                method1 = jest.fn();
                method2 = jest.fn();
                method3 = jest.fn();
            }

            const names = allMockMethodsOfInstance(new TestMockClass).except('method1').methodNames;

            expect(names).toEqual(['method2', 'method3']);
        });
        test('ignores non-existent methods', () => {
            const names = allMockMethodsOfInstance({}).except('nonExistentMethod').methodNames;

            expect(names).toEqual([]);
        });
    });
});