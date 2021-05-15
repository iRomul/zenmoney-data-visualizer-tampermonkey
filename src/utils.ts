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

export const ops = {

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
}

class ArrayOps<T> {

    private readonly array: T[];

    constructor(array: T[]) {
        this.array = array;
    }

    groupBy<K>(keyFn: (value: T) => K): MapOps<K, T[]> {
        const map = this.array.reduce((acc: Map<K, T[]>, it) => {
            acc.set(keyFn(it), [...acc.get(keyFn(it)) || [], it]);
            return acc;
        }, new Map());

        return new MapOps(map);
    }

    map<U>(callbackfn: (value: T, index: number, array: T[]) => U): ArrayOps<U> {
        return new ArrayOps(this.array.map(callbackfn));
    }

    toArray(): T[] {
        return this.array;
    }
}


export class MapOps<K, V> {

    private readonly map: Map<K, V>;

    constructor(map: Map<K, V>) {
        this.map = map;
    }

    mapValues<T>(mapFn: (key: K, value: V) => T): MapOps<K, T> {
        const map = new Map();

        for (let [key, value] of this.map.entries()) {
            map.set(key, mapFn(key, value));
        }

        return new MapOps(map);
    };

    toMap(): Map<K, V> {
        return this.map;
    }
}
