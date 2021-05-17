export function minMax<T>(items: IterableIterator<T>): { min: T, max: T } {
    const list = [...items].sort();

    const min = list[0];
    const max = list[list.length - 1];

    return {min, max};
}

export function* nts(count: number): Generator<number> {
    for (let i = 0; i < count; i++) {
        yield i;
    }
}

export function datesRange(start: Date, end: Date): Date[] {
    let arr = [];
    let dt = new Date(start);
    for (; dt <= end; dt.setDate(dt.getDate() + 1)) {
        arr.push(new Date(dt));
    }
    return arr;
}

export const _ = {

    fromObject<T>(o: { [s: string]: T }): ObjectOps<T> {
        return new ObjectOps(o);
    },

    fromArray<T>(array: T[]): ArrayOps<T> {
        return new ArrayOps(array);
    }
}

class ObjectOps<T> {

    private readonly obj: { [s: string]: T };

    constructor(obj: { [p: string]: T }) {
        this.obj = obj;
    }

    values(): ArrayOps<T> {
        return new ArrayOps<T>(Object.values(this.obj));
    }

    asMap(): MapOps<string, T> {
        return new MapOps(new Map(Object.entries(this.obj)));
    }
}

class ArrayOps<T> {

    private readonly internalArray: T[];

    constructor(array: T[]) {
        this.internalArray = array;
    }

    associate<K, V>(entryFn: (value: T) => [K, V]): MapOps<K, V> {
        const newMap = new Map<K, V>();

        this.internalArray.forEach(value => {
            const [newKey, newValue] = entryFn(value);

            newMap.set(newKey, newValue);
        })

        return new MapOps(newMap);
    }

    groupBy<K>(keyFn: (value: T) => K): MapOps<K, T[]> {
        const map = this.internalArray.reduce((acc: Map<K, T[]>, it) => {
            acc.set(keyFn(it), [...acc.get(keyFn(it)) || [], it]);
            return acc;
        }, new Map());

        return new MapOps(map);
    }

    map<U>(callbackfn: (value: T, index: number, array: T[]) => U): ArrayOps<U> {
        return new ArrayOps(this.internalArray.map(callbackfn));
    }

    flatMap<U>(callbackFn: (value: T, index: number, array: T[]) => U[]): ArrayOps<U> {
        return new ArrayOps(this.internalArray.flatMap(callbackFn));
    }

    filter(predicate: (value: T, index: number, array: T[]) => boolean): ArrayOps<T> {
        return new ArrayOps(this.internalArray.filter(predicate));
    }

    firstOrNull(lookupFn: (value: T) => boolean): T | null {
        for (let value of this.internalArray) {
            if (lookupFn(value)) {
                return value;
            }
        }

        return null;
    }

    toArray(): T[] {
        return this.internalArray;
    }
}


export class MapOps<K, V> {

    private readonly internalMap: Map<K, V>;

    constructor(map: Map<K, V>) {
        this.internalMap = map;
    }

    mapValues<T>(mapFn: (key: K, value: V) => T): MapOps<K, T> {
        const map = new Map();

        for (let [key, value] of this.internalMap.entries()) {
            map.set(key, mapFn(key, value));
        }

        return new MapOps(map);
    };

    values(): ArrayOps<V> {
        return new ArrayOps([...this.internalMap.values()]);
    }

    entries(): ArrayOps<[K, V]> {
        return new ArrayOps([...this.internalMap.entries()]);
    }

    toMap(): Map<K, V> {
        return this.internalMap;
    }
}
