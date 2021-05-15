import {ops} from "./utils";
import {Category} from "./Category";
import {ZMCache, ZMTransaction} from "./ZmModel";
import {ZM} from "./ZmData";
import config from "./config";

export class DataStorage {

    readonly groupedData: Map<string, Map<string, ZMTransaction[]>>;

    constructor(data: { [p: number]: ZMCache }) {
        this.groupedData = ops.fromObject(data)
            .values()
            .map(v => v.data)
            .groupBy(v => v.date)
            .mapValues((k, v) => {
                return ops.fromArray(v)
                    .groupBy(v => {
                        const catId = config.mapZmTagToCategory(ZM.resolveTag(v));
                        return catId;
                    })
                    .toMap();
            })
            .toMap();
    }

    getAt(date: string, category: Category, subCategory: Category, i: number): ZMTransaction | null {
        const categoryTitle = subCategory?.name ? subCategory.name : category.name;
        return this.groupedData?.get(date)?.get(categoryTitle)?.[i];
    }
}