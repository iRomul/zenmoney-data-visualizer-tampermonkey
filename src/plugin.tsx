import {datesRange, minMax} from "./utils";
import {JSX} from "./jsx";
import {TX} from "./TransactiosTable";
import {DataStorage} from "./DataStorage";
import {ZM} from "./ZmData";

function perform() {
    document.querySelector(".transactionForm").after(
        <div>
            <button class="btn btn-secondary" ev-click="visualize">Визуализировать</button>
        </div>
    );
    // const loadBtn = document.getElementById("dv-load");
    const rootDiv = <div id="dv-plugin-root"/>

    document.body.appendChild(rootDiv);

    // loadBtn.addEventListener("click", () => {
    //     ZM.transactions.load();
    // }, false);

    JSX.addEventListener("visualize", () => {
        const dataStorage = new DataStorage(ZM.transactions.cache);

        const dateRange = minMax(dataStorage.groupedData.keys());

        const datesRangeList = datesRange(new Date(dateRange.min), new Date(dateRange.max))
            .map((v) => v.toISOString().slice(0, 10));

        rootDiv.appendChild(
            <div class="dv-dialog-fullscreen">
                <div class="dv-dialog modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Таблица расходов</h5>
                            <button type="button" class="btn-close" ev-click="txTableClose"/>
                        </div>
                        <div class="modal-body">
                            <TX.TransactionsTable
                                datesList={datesRangeList}
                                dataStorage={dataStorage}/>
                        </div>
                        <div class="modal-footer">

                        </div>
                    </div>
                </div>
            </div> as Node
        );

        JSX.addEventListener("txTableClose", () => {
            while (rootDiv.firstChild) {
                rootDiv.firstChild.remove();
            }
        });

        JSX.addEventListener("showDetails", ev => {
            const target = ev.currentTarget as HTMLElement;

            const txId = target.dataset["transactionId"];
            const tx = dataStorage.findTransactionById(txId);

            const footer = document.getElementsByClassName("modal-footer")[0];

            while (footer.firstChild) {
                footer.firstChild.remove();
            }

            const formatDate = (date: string) =>
                new Date(date).toLocaleString("ru-RU", {day: "2-digit", month: "short"})
            const formatDay = (date: string) =>
                new Date(date).toLocaleString("ru-RU", {weekday: "long"})

            footer.appendChild(
                <div style="display:flex;flex-direction:row;">
                    <div style="padding:0 30px;">
                        <div>{formatDate(tx?.date)}</div>
                        <div>{formatDay(tx?.date)}</div>
                    </div>
                    <div style="padding:0 30px;">
                        <div>
                            <b>{ZM.resolveTag(tx)?.title ?? <i>Без категории</i>}</b>
                            &nbsp;&mdash;&nbsp;{tx?.payee ?? <i>Не указан</i>}
                            <span/>
                        </div>
                        <div style="color:#999999;">
                            {tx?.comment ?? <i>...</i>}
                        </div>
                    </div>
                    <div style="padding:0 30px;">
                        <TX.TransactionPrice transaction={tx}/>
                    </div>
                </div>
            )
        });
    });
}

(function () {
    'use strict';

    // language=CSS
    GM_addStyle(`
        .dv-dialog-fullscreen {
            font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans",
            "Liberation Sans", sans-serif;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1000;
        }

        .dv-dialog {
            padding: 1rem;
        }

        .modal-dialog-scrollable {
            height: calc(100% - 2rem);
        }

        .modal-content {
            position: relative;
            display: flex;
            flex-direction: column;
            width: 100%;
            backdrop-filter: blur(5px);
            background-color: rgba(255, 255, 255, 0.5);
            background-clip: padding-box;
            border: 1px solid rgba(0, 0, 0, .2);
            border-radius: .3rem;
            outline: 0;
        }

        .modal-dialog-scrollable .modal-content {
            max-height: 100%;
            overflow: hidden;
        }

        .modal-header {
            display: flex;
            flex-shrink: 0;
            align-items: center;
            justify-content: space-between;
            padding: 1rem 1rem;
            border-bottom: 1px solid #dee2e6;
            border-top-left-radius: calc(.3rem - 1px);
            border-top-right-radius: calc(.3rem - 1px);
        }

        .modal-footer {
            display: flex;
            flex-wrap: wrap;
            flex-shrink: 0;
            align-items: center;
            justify-content: flex-end;
            padding: .75rem;
            border-top: 1px solid #dee2e6;
            border-bottom-right-radius: calc(.3rem - 1px);
            border-bottom-left-radius: calc(.3rem - 1px);
        }

        .modal-title {
            margin-bottom: 0;
            line-height: 1.5;
        }

        h5.modal-title {
            font-size: 1.25rem;
            margin-top: 0;
            font-weight: 500;
        }

        .modal-body {
            position: relative;
            flex: 1 1 auto;
            padding: 1rem;
        }

        .modal-dialog-scrollable .modal-body {
            overflow-y: auto;
        }

        .dv-table {
            border-collapse: collapse;
            border-spacing: 0;
            table-layout: fixed;
            width: 100%;
            background: white;
            min-width: 2500px;
        }

        .dv-table td {
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }

        .dv-value {
            border: 1px solid #efefef;
        }

        .dv-cat {
            text-align: left;
            font-weight: bold;
            white-space: nowrap;
            vertical-align: bottom;
            padding: 2px 3px 2px 3px;
            font-size: 14pt;
            height: 35px;
        }

        .dv-sub-cat {
            font-size: 8pt;
            height: 20px;
            vertical-align: bottom;
        }

        .dv-cat-incomes, .dv-cat-incomes-salary, .dv-cat-incomes-others {
            background-color: #d9d2e9;
            color: #20124d;
        }

        .dv-cat-mandatory {
            background-color: #ead1dc;
            color: #4c1130;
        }

        .dv-cat-commons {
            background-color: #fce5cd;
            color: #660000;
        }

        .dv-cat-leisure, .dv-cat-leisure-food, .dv-cat-leisure-others {
            background-color: #fff2cc;
            color: #783f04;
        }

        .dv-cat-house {
            background-color: #d9ead3;
            color: #274e13;
        }

        .dv-cat-car-transport {
            background-color: #d0e0e3;
            color: #0c343d;
        }

        .dv-cat-health {
            background-color: #c9daf8;
            color: #0c343d;
        }

        .dv-cat-self-care {
            background-color: #cfe2f3;
            color: #0c343d;
        }

        .dv-cat-others {
            background-color: #efefef;
            color: #000000;
        }

        .btn-close {
            box-sizing: content-box;
            width: 1em;
            height: 1em;
            padding: .25em .25em;
            color: #000;
            background: transparent url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23000'%3e%3cpath d='M.293.293a1 1 0 011.414 0L8 6.586 14.293.293a1 1 0 111.414 1.414L9.414 8l6.293 6.293a1 1 0 01-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 01-1.414-1.414L6.586 8 .293 1.707a1 1 0 010-1.414z'/%3e%3c/svg%3e") center/1em auto no-repeat;
            border: 0;
            border-radius: .25rem;
            opacity: .5;
            cursor: pointer;
        }

        .btn {
            display: inline-block;
            font-weight: 400;
            line-height: 1.5;
            color: #212529;
            text-align: center;
            text-decoration: none;
            vertical-align: middle;
            cursor: pointer;
            -webkit-user-select: none;
            -moz-user-select: none;
            user-select: none;
            background-color: transparent;
            border: 1px solid transparent;
            padding: .375rem .75rem;
            font-size: 1rem;
            border-radius: .25rem;
            transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out;
        }

        .btn-link {
            font-weight: 400;
            color: #0d6efd;
            text-decoration: underline;
        }

        .btn-secondary {
            color: #fff;
            background-color: #6c757d;
            border-color: #6c757d;
        }
    `);

    new MutationObserver((mutations, observer) => {
        if (document.querySelector(".transactionForm")) {
            observer.disconnect();

            perform();
        }
    }).observe(document, {childList: true, subtree: true});
})();

/* Tampermonkey */
declare function GM_addStyle(css: string);
