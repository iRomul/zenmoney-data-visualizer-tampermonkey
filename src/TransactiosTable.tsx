import {nts} from "./utils";
import {JSX} from "./jsx";
import {Category} from "./Category";
import {DataStorage} from "./DataStorage";
import {ZMTransaction} from "./ZmModel";

export type TransactionsTableData = {
    datesList: string[],
    categories: Category[]
    dataStorage: DataStorage
};

export const TX = {
    TransactionsTable(data: TransactionsTableData) {
        const {datesList, categories: cats, dataStorage} = data;

        return <div id="dv-table-view" class="dv-modal" style="display:none;">
            <div class="dv-modal-inner">
                <div class="dv-nav">
                    <div class="dv-nav-title">
                        <h1>Таблица расходов</h1>
                    </div>
                    <div class="dv-nav-buttons">
                        <button class="btn btn-primary">Закрыть</button>
                    </div>
                </div>
                <div class="dv-content">
                    <table class="dv-table">
                        <tr>
                            <td class="dv-cat" rowspan="2">Date</td>
                            {
                                cats.map(cat =>
                                    <td colspan={cat.totalLength} class={`dv-cat dv-cat-${cat.style}`}>
                                        {cat.name || ""}
                                    </td>)
                            }
                        </tr>

                        <tr>
                            {
                                cats.flatMap(cat =>
                                    cat.safeSubCategories.map(subcat =>
                                        <td colspan={subcat.length} class={`dv-sub-cat dv-cat-${cat.style}`}>
                                            {subcat.name || ""}
                                        </td>)
                                )
                            }
                        </tr>

                        {
                            datesList.map(date =>
                                <tr>
                                    <td>{date}</td>
                                    {
                                        cats.flatMap(cat =>
                                            cat.safeSubCategories.flatMap(subcat =>
                                                [...nts(subcat.length)].map(i => {
                                                    const operation = dataStorage.getAt(date, cat, subcat, i)

                                                    return <td title={operation?.comment}>
                                                        <TX.TransactionPrice transaction={operation}/>
                                                    </td>
                                                })
                                            ))
                                    }
                                </tr>)
                        }
                    </table>
                </div>
            </div>
        </div>
    },

    TransactionPrice(data: { transaction: ZMTransaction }) {
        const transaction = data?.transaction;

        if (transaction?.income) {
            return <span style="color:green;">{`${transaction.income}`}</span>;
        } else if (transaction?.outcome) {
            return <span>{`${transaction.outcome}`}</span>;
        } else if (transaction) {
            throw new Error(`No income or outcome in data: ${data}`);
        } else {
            return "";
        }
    }
}