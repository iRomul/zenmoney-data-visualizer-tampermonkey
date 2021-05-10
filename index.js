// ==UserScript==
// @name         ZenMoney Data Viewer
// @version      1.0.0
// @description  try to take over the world!
// @author       RK
// @match        https://zenmoney.ru/a/*
// @icon         https://www.google.com/s2/favicons?domain=tampermonkey.net
// @grant        GM_addStyle
// ==/UserScript==

class Category {

    constructor(name, length, style, subCategories) {
        /** @type {string} */
        this.name = name;
        /** @type {number} */
        this.length = length;
        /** @type {string} */
        this.style = style;
        /** @type {Category[]} */
        this.subCategories = !!subCategories ? subCategories : [];
    }

    /**
     *
     * @returns {number}
     */
    get totalLength() {
        if (!!this.length) {
            return this.length;
        } else {
            return this.subCategories
                .map(v => v.length)
                .filter(v => v != null)
                .reduce((acc, v) => acc + v);
        }
    }
}

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
        const subcats = (cat) => cat.subCategories.length === 0 ? [new Category("", cat.length)] : cat.subCategories;

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
                                <td class="dv-cat" rowspan="2">Date</td>
                                ${tags(cats, cat =>
            `<td colspan="${cat.totalLength}" class="dv-cat dv-cat-${cat.style}">${cat.name}</td>`)}
                            </tr>

                            <tr>
                                ${tags(cats, cat =>
            tags(subcats(cat), subcat =>
                `<td colspan="${subcat.length}" class="dv-sub-cat dv-cat-${cat.style}">${subcat.name}</td>`))}
                            </tr>

                            ${tags(datesRangeList, date =>
            `
                                <tr>
                                    <td>${date}</td>
                                    ${tags(cats, cat =>
                tags(subcats(cat), subcat =>
                    tags(repeat(subcat.length, `<td>${formatPrice(dat(date, 0))}</td>`), col =>
                        `<td>${formatPrice(dat(col, 0))}</td>`)))}
                                </tr>
                                `)}
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

    new MutationObserver(function (mutations) {
        if (document.querySelector(".transactionForm")) {
            this.disconnect();
            perform();
        }
    }).observe(document, {childList: true, subtree: true});
})();

/**
 * @template T
 * @callback TagsCallback
 * @param {T} item
 * @return {string}
 */

/**
 * @template T
 * @param {T[]} items
 * @param {TagsCallback} f
 * @return {string}
 */
function tags(items, f) {
    return items.map(f).join("")
}

/**
 *
 * @return {Transactions}
 */
function transactions() {
    return zm.loader.page.transaction;
}

/**
 *
 * @template T
 * @param {number} count
 * @param {T} content
 * @returns {T[]}
 */
function repeat(count, content) {
    return Array.from(Array(count), () => content);
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