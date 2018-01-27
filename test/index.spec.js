import Observable from '../src/index';

jest.useFakeTimers();

expect.extend({
    toBeObservable(received) {
        return ({
            message: () =>{
                return this.utils.matcherHint(`${this.isNot ? '.not' : ''}.toBeObservable`, 'received', '') + '\n\n' +
                `Expected value ${this.isNot ? 'not ' : ''}to be Observable, received:\n` +
                `  ${this.utils.printReceived(received)}`;
            },
            pass: Observable.isObservable(received)
        });
    }
});

describe('React Router Lockin - Observable', () => {
    it('instantiates', () => {
        expect(new Observable({})).toBeTruthy();
    });

    it('complains when called without "new"', () => {
        expect(() => {
            Observable({});
        }).toThrowErrorMatchingSnapshot();
    });

    it('allows reading values', () => {
        const observable = new Observable({ a: 5 });

        expect(observable.a).toBe(5);
    });

    it('allows multiple listeners', () => {
        const observable = new Observable({ a: 5 });

        const listeners = [];
        for (let i = 0; i < 100; i++) {
            const listener = jest.fn();

            listeners.push(listener);
            Observable.observe(observable, 'a', listener);
        }

        observable.a = 11;

        jest.runOnlyPendingTimers();

        listeners.forEach((listener) => expect(listener).toBeCalledWith('a', 11, 5));

        expect(listeners.length).toBeGreaterThan(0);
        expect.assertions(listeners.length + 1);
    });

    describe('notify', () => {
        describe('key observer when field is', () => {
            it('created', () => {
                const observable = new Observable({});

                const listener = jest.fn();
                Observable.observe(observable, 'b', listener);

                observable.b = 2;
                observable.c = 2;

                jest.runOnlyPendingTimers();

                expect(listener).toBeCalledWith('b', 2, undefined);
                expect(listener).not.toBeCalledWith('c', 2, undefined);
            });

            it('changed', () => {
                const observable = new Observable({ a: 5 });

                const listener = jest.fn();
                Observable.observe(observable, 'a', listener);

                observable.a = 15;
                observable.c = 2;

                jest.runOnlyPendingTimers();

                expect(listener).toBeCalledWith('a', 15, 5);
                expect(listener).not.toBeCalledWith('c', 2, undefined);
            });

            it('removed', () => {
                const observable = new Observable({ a: 5 });

                const listener = jest.fn();
                Observable.observe(observable, 'a', listener);

                delete observable.a;
                delete observable.b;

                jest.runOnlyPendingTimers();

                expect(listener).toBeCalledWith('a', undefined, 5);
                expect(listener).not.toBeCalledWith('b', undefined, undefined);
            });
        });

        describe('global observer when field is', () => {
            it('created', () => {
                const observable = new Observable({});

                const listener = jest.fn();
                Observable.observe(observable, listener);

                observable.b = 2;
                observable.c = 3;

                jest.runOnlyPendingTimers();

                expect(listener).toBeCalledWith('b', 2, undefined);
                expect(listener).toBeCalledWith('c', 3, undefined);
            });

            it('changed', () => {
                const observable = new Observable({ a: 5, b: 0 });

                const listener = jest.fn();
                Observable.observe(observable, listener);

                observable.a = 15;
                observable.b = 3;

                jest.runOnlyPendingTimers();

                expect(listener).toBeCalledWith('a', 15, 5);
                expect(listener).toBeCalledWith('b', 3, 0);
            });

            it('removed', () => {
                const observable = new Observable({ a: 5, g: 'a' });

                const listener = jest.fn();
                Observable.observe(observable, listener);

                delete observable.a;
                delete observable.g;

                jest.runOnlyPendingTimers();

                expect(listener).toBeCalledWith('a', undefined, 5);
                expect(listener).toBeCalledWith('g', undefined, 'a');
            });
        });

        describe('array (global)', () => {
            it('push', () => {
                const observable = new Observable([]);

                const listener = jest.fn();
                Observable.observe(observable, listener);

                observable.push(1);
                observable.push(2);

                jest.runOnlyPendingTimers();

                expect(listener).toBeCalledWith("0", 1, undefined);
                expect(listener).toBeCalledWith("1", 2, undefined);
            });

            it('replace', () => {
                const observable = new Observable([9,10,11]);

                const listener = jest.fn();
                Observable.observe(observable, listener);

                const removed = observable.splice(0, 1, 5);

                expect(removed[0]).toBe(9);

                jest.runOnlyPendingTimers();

                expect(listener).toBeCalledWith("0", 5, 9);
            });

            it('insert', () => {
                const observable = new Observable([9,10,11]);

                const listener = jest.fn();
                Observable.observe(observable, listener);

                const removed = observable.splice(1, 0, 5);

                expect(removed.length).toBe(0);

                jest.runOnlyPendingTimers();

                expect(listener).toBeCalledWith("1", 5, 10);
                expect(listener).toBeCalledWith("2", 10, 11);
                expect(listener).toBeCalledWith("3", 11, undefined);
            });

            it('insert & replace', () => {
                const observable = new Observable([9,10,11]);

                const listener = jest.fn();
                Observable.observe(observable, listener);

                const removed = observable.splice(1, 1, 5, 6);

                expect(removed.length).toBe(1);

                jest.runOnlyPendingTimers();

                expect(listener).toBeCalledWith("1", 5, 10);
                expect(listener).toBeCalledWith("2", 6, 11);
                expect(listener).toBeCalledWith("3", 11, undefined);
            });

            it('pop', () => {
                const observable = new Observable([1, 2, 3]);

                const listener = jest.fn();
                Observable.observe(observable, listener);

                const value = observable.pop();
                expect(value).toBe(3);

                jest.runOnlyPendingTimers();

                expect(listener).toBeCalledWith("2", undefined, 3);
            });

            it('shift', () => {
                const observable = new Observable([1, 2, 3]);

                const listener = jest.fn();
                Observable.observe(observable, listener);

                const value = observable.shift();
                expect(value).toBe(1);

                jest.runOnlyPendingTimers();

                expect(listener).toBeCalledWith("0", 2, 1);
                expect(listener).toBeCalledWith("1", 3, 2);
                expect(listener).toBeCalledWith("2", undefined, 3);
            });

            it('unshift', () => {
                const observable = new Observable([1, 2, 3]);

                const listener = jest.fn();
                Observable.observe(observable, listener);

                observable.unshift(9);

                jest.runOnlyPendingTimers();

                expect(listener).toBeCalledWith("0", 9, 1);
                expect(listener).toBeCalledWith("1", 1, 2);
                expect(listener).toBeCalledWith("2", 2, 3);
                expect(listener).toBeCalledWith("3", 3, undefined);
            });
        });
    });

    describe('isObservable', () => {
        it('returns true for Observables', () => {
            for (const item of [new Observable({}), new Observable([])]) {
                expect(item).toBeObservable();
            }
        });

        it('returns false for Observables', () => {
            for (const item of [undefined, null, 0, 1, 'asd', {}, [], true, false]) {
                expect(item).not.toBeObservable();
            }
        });
    });

    it('doesn\'t notify when set value is the same', () => {
        const observable = new Observable({ a: 1 });

        const listener = jest.fn();
        Observable.observe(observable, 'a', listener);

        observable.a = 1;

        jest.runOnlyPendingTimers();

        expect(listener).not.toBeCalled();
    });
});
