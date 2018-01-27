// @flow
import MultiMap from 'multimap';
import invariant from 'invariant';

type KeyType = string | number;

type ListenerCb = (KeyType, *, *) => void;

type UnListenCb = () => void;

const SubscribeSymbol = Symbol('subscribe');

export default
class Observable {
    static observe = (observable: Observable, ...args: *): UnListenCb => {
        // $FlowIgnore
        invariant(observable[SubscribeSymbol], 'Observable.observe can be called only on Observable instances.');
        const observer: ListenerCb = args.pop();
        const key: ?string = args.pop();

        // $FlowIgnore
        return observable[SubscribeSymbol](key, observer);
    };

    static isObservable = (observable: Observable): boolean => {
        // $FlowIgnore
        return !!observable && !!observable[SubscribeSymbol];
    };

    constructor<O: {}>(data: O): O {
        const observers = new MultiMap();
        const globalObservers = new Set();

        const notify = (key: KeyType, value: *, old: *) => {
            const allObservers = Array.from(globalObservers);
            const keyObservers = observers.get(key);

            if (keyObservers) {
                allObservers.push(...Array.from(keyObservers));
            }

            setTimeout(() => {
                allObservers.forEach((observer: ListenerCb): void => observer(key, value, old));
            });
        };

        const subscribe = (key: ?string, observer: ListenerCb): UnListenCb => {
            if (key) {
                observers.set(key, observer);

                return (): void => observers.delete(key, observer);
            } else {
                globalObservers.add(observer);

                return () => {
                    globalObservers.delete(observer);
                };
            }
        };

        return new Proxy(data, {
            set: (target: O, key: KeyType, value: *): true => {
                const old = target[key];
                if (old !== value) {
                    target[key] = value;

                    notify(key, value, old);
                }

                return true;
            },

            deleteProperty: (target: O, key: KeyType): boolean => {
                if (key in target) {
                    notify(key, undefined, target[key]);
                    delete target[key];
                }

                return true;
            },

            get: (target: O, key: KeyType): * => {
                if (key === SubscribeSymbol) {
                    return subscribe;
                }

                return target[key];
            }
        });
    }
}
