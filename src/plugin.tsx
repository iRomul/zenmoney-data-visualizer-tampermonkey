import {datesRange, minMax, nts} from "./utils";
import {JSX} from "./jsx";
import {Category} from "./Category";
import {TX} from "./TransactiosTable";
import {DataStorage} from "./DataStorage";
import {ZM} from "./ZmData";

const DV = {
    ControlButtons() {
        return <div>
            <button id="dv-vis" class="btn btn-secondary">Визуализировать</button>
            <button id="dv-load" class="btn btn-secondary">Загрузить ещё</button>
        </div>
    }
}

function perform() {
    document.querySelector(".transactionForm")
        .after(<DV.ControlButtons/>);

    const visBtn = document.getElementById("dv-vis");
    const loadBtn = document.getElementById("dv-load");

    loadBtn.addEventListener("click", () => {
        ZM.transactions.load();
    }, false);

    visBtn.addEventListener("click", () => {
        const dataStorage = new DataStorage(ZM.transactions.cache);

        const dateRange = minMax(dataStorage.groupedData.keys());

        const datesRangeList = datesRange(new Date(dateRange.min), new Date(dateRange.max))
            .map((v) => v.toISOString().slice(0, 10));

        const cats = [
            new Category(
                "Incomes",
                null,
                "incomes",
                [
                    new Category("Salary", 2),
                    new Category("Other", 2)
                ]
            ),
            new Category(
                "Mandatory",
                2,
                "mandatory"
            ),
            new Category(
                "Commons",
                5,
                "commons"
            ),
            new Category(
                "Leisure",
                null,
                "leisure",
                [
                    new Category("Food", 4),
                    new Category("Other", 2)
                ]
            ),
            new Category(
                "House",
                4,
                "house"
            ),
            new Category(
                "Car / Transport",
                4,
                "car-transport"
            ),
            new Category(
                "Health",
                4,
                "health"
            ),
            new Category(
                "Self Care",
                4,
                "self-care"
            ),
            new Category(
                "Others",
                8,
                "others"
            )
        ];

        const tableView = <TX.TransactionsTable
            datesList={datesRangeList}
            categories={cats}
            dataStorage={dataStorage}/>

        tableView.style.display = "initial";

        document.body.appendChild(tableView);
    }, false);
}

(function () {
    'use strict';

    // language=CSS
    GM_addStyle(`
        .dv-table {
            border-collapse: collapse;
            border-spacing: 0;
            table-layout: fixed;
            width: 100%;
            background: white;
        }

        .dv-table tr > td {
            border: 1px solid #efefef;
        }

        .dv-cat {
            text-align: left;
            font-weight: bold;
            white-space: nowrap;
            vertical-align: bottom;
            padding: 2px 3px 2px 3px;
            font-size: 10pt;
            border: none;
        }

        .dv-sub-cat {
            font-size: 8pt;
        }

        .dv-cat-incomes {
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

        .dv-cat-leisure {
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

        .dv-modal {
            font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            backdrop-filter: blur(9px);
            z-index: 1000;
            overflow: hidden;
            outline: 0;
        }

        .dv-modal-inner {
            display: flex;
            margin: 25px;
            flex-direction: column;
        }

        .dv-nav {
            display: flex;
        }

        .dv-nav-title {
            flex-grow: 1;
        }

        .dv-nav-title > h1 {
            font-size: 1.5vw;
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
