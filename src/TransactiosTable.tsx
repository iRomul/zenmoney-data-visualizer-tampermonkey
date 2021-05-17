import {nts} from "./utils";
import {JSX} from "./jsx";
import {DataStorage} from "./DataStorage";
import {ZMTransaction} from "./ZmModel";
import {Formats} from "./monetary/Format";
import {Monetary} from "./monetary/Monetary";

export type TransactionsTableData = {
    datesList: string[],
    dataStorage: DataStorage
};

export const TX = {
    TransactionsTable(data: TransactionsTableData) {
        const {datesList, dataStorage} = data;

        return <table class="dv-table">
            <tr>
                <td class="dv-cat" rowspan="2">Date</td>
                {
                    dataStorage.upperCategories.map(cat =>
                        <td colspan={cat.cells} class={`dv-cat dv-cat-${cat.id}`}>
                            {cat.name ?? ""}
                        </td>)
                }
            </tr>

            <tr>
                {
                    dataStorage.loweCategories.map(cat =>
                        <td colspan={cat.cells} class={`dv-sub-cat dv-cat-${cat.id}`}>
                            {cat.name ?? ""}
                        </td>)
                }
            </tr>

            {
                datesList.map(date =>
                    <tr>
                        <td class="dv-value">{date}</td>
                        {
                            dataStorage.loweCategories.flatMap(cat => {
                                const transactions = dataStorage.findTransactionByDateAndCategory(date, cat);
                                let operationsOverflow = false;

                                if (transactions && cat.cells < transactions.length) {
                                    operationsOverflow = true;
                                    console.warn(`Not enough space for operations (date: ${date}, cat: ${cat?.name})`);
                                }

                                return [...nts(cat.cells)].map(i => {
                                    if (operationsOverflow && (transactions.length - 1) == i) {
                                        return <td class="dv-value">...</td>
                                    } else {
                                        const transaction = transactions?.[i];

                                        if (transaction) {
                                            return <td class="dv-value"
                                                       ev-click="showDetails"
                                                       data-transaction-id={transaction.id}>
                                                <TX.TransactionPrice transaction={transaction}/>
                                            </td>;
                                        } else {
                                            return <td class="dv-value"/>;
                                        }
                                    }
                                });
                            })
                        }
                    </tr>)
            }
        </table>
    },

    TransactionPrice(data: { transaction: ZMTransaction }) {
        const transaction = data?.transaction;
        const format = Formats.RUSSIAN;

        if (transaction?.income) {
            const monetary = new Monetary(transaction?.income.toString());
            return <span style="color:green;">{format(monetary)}</span>;
        } else if (transaction?.outcome) {
            const monetary = new Monetary(transaction?.outcome.toString());
            return <span>{format(monetary)}</span>;
        } else if (transaction) {
            throw new Error(`No income or outcome in data: ${data}`);
        } else {
            return "";
        }
    }
}