// ==UserScript==
// @name         ZenMoney Data Viewer
// @version      1.0.0
// @description  try to take over the world!
// @author       RK
// @match        https://zenmoney.ru/a/*
// @icon         https://www.google.com/s2/favicons?domain=tampermonkey.net
// @grant        GM_addStyle
// ==/UserScript==

function perform() {
    const buttons = ce(`
        <div>
            <button id="dv-vis" class="btn btn-secondary">Визуализировать</button>
            <button id="dv-load" class="btn btn-secondary">Загрузить ещё</button>
        </div>
    `);

    document.querySelector(".transactionForm").after(buttons);

    const visBtn = document.getElementById("dv-vis");
    const loadBtn = document.getElementById("dv-load");

    loadBtn.addEventListener("click", () => {
        transactions().load();
    }, false);

    visBtn.addEventListener("click", () => {
        const data = transactions().cache;

        /** @type {Object.<string, CacheData[]>} */
        const groupedData = Object.values(data)
            .map(v => v.data)
            .reduce((r, a) => {
                r[a.date] = [...r[a.date] || [], a];
                return r;
            }, {});

        const operationsSparseDates = Object.keys(groupedData).sort();

        const minDate = operationsSparseDates[0];
        const maxDate = operationsSparseDates.reverse()[0];

        const datesRangeList = datesRange(new Date(minDate), new Date(maxDate))
            .map((v) => v.toISOString().slice(0, 10));

        const dat = (date, i) => groupedData[date] ? (groupedData[date][i] ? groupedData[date][i] : {}) : {}
        const formatPrice = (data) => {
            if (data.income) {
                return `<span style="color:green;">${data.income}</span>`;
            } else if (data.outcome) {
                return `<span>${data.outcome}</span>`;
            } else {
                return "";
            }
        }

        const tableView = ce(`
            <div id="dv-table-view" class="dv-modal" style="display:none;">
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
                                <th>Date</th>
                                <th colspan="4" class="dv-cat dv-cat-incomes">Incomes</th>
                                <th colspan="4" class="dv-car dv-cat-mandatory">Mandatory</th>
                                <th colspan="4" class="dv-car dv-cat-commons">Commons</th>
                            </tr>
            
                            ${datesRangeList.map(v => {
                                return `
                                    <tr>
                                        <td>${v}</td>
                                        <td>${formatPrice(dat(v, 0))}</td>
                                        <td>${formatPrice(dat(v, 1))}</td>
                                        <td>${formatPrice(dat(v, 2))}</td>
                                        <td>${formatPrice(dat(v, 3))}</td>
                                        <td>${formatPrice(dat(v, 4))}</td>
                                        <td>${formatPrice(dat(v, 5))}</td>
                                        <td>${formatPrice(dat(v, 6))}</td>
                                        <td>${formatPrice(dat(v, 7))}</td>
                                        <td>${formatPrice(dat(v, 8))}</td>
                                        <td>${formatPrice(dat(v, 9))}</td>
                                        <td>${formatPrice(dat(v, 10))}</td>
                                        <td>${formatPrice(dat(v, 11))}</td>
                                        <td>${formatPrice(dat(v, 12))}</td>
                                    </tr>
                                `
                            })
                            .join("")
                            }
                        </table>
                    </div>
                </div>
            </div>
    `);


        tableView.style.display = "initial";

        document.body.appendChild(tableView);
    }, false);
}

(function () {
    'use strict';

    // language=CSS
    GM_addStyle(`
    .dv-cat {
        text-align: left;
        font-weight: bold;
        white-space: nowrap;
        vertical-align: bottom;
        padding: 2px 3px 2px 3px;
        font-size: 1.1vw;
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
    
    .dv-table tr > td {
        border: 1px solid black;
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

    new MutationObserver(function (mutations) {
        if (document.querySelector(".transactionForm")) {
            this.disconnect();
            perform();
        }
    }).observe(document, {childList: true, subtree: true});
})();

/**
 *
 * @return {Transactions}
 */
function transactions() {
    return zm.loader.page.transaction;
}

/**
 *
 * @param {string} html
 * @return {Node}
 */
function ce(html) {
    const template = document.createElement("template");
    template.innerHTML = html.trim();
    return template.content.firstChild;
}

/**
 * Creates an array of dates between start and end
 * @param {Date} start
 * @param {Date} end
 * @return {Date[]}
 */
function datesRange(start, end) {
    let arr = [];
    let dt = new Date(start);
    for (; dt <= end; dt.setDate(dt.getDate() + 1)) {
        arr.push(new Date(dt));
    }
    return arr;
}

/**
 * @typedef CacheData
 * @property {number} account_income
 * @property {number} account_outcome
 * @property {number} category
 * @property {string} changed
 * @property {string} comment
 * @property {string} created
 * @property {string} date
 * @property {boolean} deleted
 * @property {number} direction
 * @property {boolean} hold
 * @property {number} id
 * @property {boolean} inbalance_income
 * @property {boolean} inbalance_outcome
 * @property {number} income
 * @property {number} outcome
 * @property {number} instrument_income
 * @property {number} instrument_outcome
 * @property {Object} merchant
 * @property {string} payee
 * @property {Object} price
 * @property {number} tag_group
 * @property {number[]} tag_groups
 * @property {number} type
 * @property {string} type_income
 * @property {string} type_outcome
 * @property {number} user
 */

/**
 * @typedef Cache
 * @property {Node} el
 * @property {CacheData} data
 */

/**
 * @typedef Transactions
 * @property {Object.<Number, Cache>} cache
 * @property {number[]} cacheOrder
 * @property number limit
 * @property number skip
 */