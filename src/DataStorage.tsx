import {_} from "./utils";
import {ZMCache, ZMTransaction} from "./ZmModel";
import {ZM} from "./ZmData";
import {CategoriesTree, config} from "./config";

type Category = {
    readonly id: string,
    readonly name: string,
    readonly cells: number,
}

function flatCategory(tree: CategoriesTree, dropName = false): Category {
    const {id, name} = tree;
    let cells;

    if (tree.subCategories && tree.subCategories.length > 0) {
        cells = tree.subCategories
            .map(cat => cat.cells)
            .reduce((acc, v) => acc + v);
    } else {
        cells = tree.cells;
    }

    const actualName = dropName ? "" : name;

    return {id, name: actualName, cells};
}

export class DataStorage {

    readonly transactionsMap: Map<string, ZMTransaction>;
    readonly groupedData: Map<string, Map<string, ZMTransaction[]>>;
    readonly categoriesMap: Map<string, Category>;
    readonly transactionsCategoriesMap: Map<number, Category>

    constructor(data: { [key: number]: ZMCache }) {
        const transactionsOps = _.fromObject(data)
            .asMap()
            .mapValues((key, value) => value.data);

        this.transactionsMap = transactionsOps.toMap();

        const transactions = transactionsOps
            .values()
            .toArray();

        this.categoriesMap = _.fromArray(config.categories)
            .flatMap(category => {
                const cats: Category[] = [flatCategory(category)];

                category.subCategories?.forEach(v => {
                    cats.push(flatCategory(v));
                })

                return cats;
            })
            .associate(value => [value.id, value])
            .toMap();

        this.transactionsCategoriesMap = _.fromArray(transactions)
            .associate(value => [value.id, this.mapTagToCategory(value)])
            .toMap();

        this.groupedData = _.fromArray(transactions)
            .groupBy(v => v.date)
            .mapValues((k, v) => {
                return _.fromArray(v)
                    .groupBy(v => this.transactionsCategoriesMap.get(v.id)?.id)
                    .toMap();
            })
            .toMap();
    }

    findTransactionByDateAndCategory(date: string, category: Category): ZMTransaction[] | null {
        return this.groupedData?.get(date)?.get(category.id);
    }

    findTransactionById(id: string): ZMTransaction | null {
        console.log(this.transactionsMap);
        return this.transactionsMap.get(id)
    }

    get upperCategories(): Category[] {
        return config.categories.map(cat => flatCategory(cat));
    }

    get loweCategories(): Category[] {
        const resultCategories: Category[] = [];

        config.categories.forEach(cat => {
            if (cat?.subCategories && cat.subCategories.length > 0) {
                cat.subCategories.forEach(subCat => {
                    resultCategories.push(flatCategory(subCat));
                });
            } else {
                resultCategories.push(flatCategory(cat, true));
            }
        });

        return resultCategories;
    }

    private mapTagToCategory(transaction: ZMTransaction): Category {
        const tag = ZM.resolveTag(transaction);

        const mappingOps = _.fromObject(config.categoriesMapping)
            .asMap()
            .entries();

        const categoryId = mappingOps
                .filter(value => value[1] !== null)
                .firstOrNull(value => value[1].includes(tag?.title))
                ?.[0]
            ?? (this.isIncomeTransaction(transaction) ? config.defaultIncomeCategory : config.defaultOutcomeCategory);

        return this.categoriesMap.get(categoryId);
    }

    private isIncomeTransaction(transaction: ZMTransaction) {
        return !!transaction.income
    }
}