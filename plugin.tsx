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

    name: string | null;
    length: number | null;
    style: string;
    subCategories: Category[];

    constructor(
        name: string | null,
        length: number | null,
        style: string | null = null,
        subCategories: Category[] | null = null
    ) {
        this.name = name;
        this.length = length;
        this.style = style ? style : "";
        this.subCategories = !!subCategories ? subCategories : [];
    }

    get totalLength(): number {
        if (!!this.length) {
            return this.length;
        } else {
            return this.subCategories
                .map(v => v.length)
                .filter(v => v != null)
                .reduce((acc, v) => acc + v);
        }
    }

    get safeSubCategories(): Category[] {
        if (this.subCategories.length === 0) {
            return [new Category(null, this.length)];
        } else {
            return this.subCategories;
        }
    }
}

class DataStorage {

    readonly groupedData: Map<string, Map<string, ZMTransaction[]>>;

    constructor(data: { [p: number]: ZMCache }) {
        this.groupedData = Object.values(data)
            .map(v => v.data)
            .groupBy(v => v.date)
            .mapValues((k, v) => {
                return v.groupBy(v => ZM.resolveTag(v).title);
            });

        console.log(this.groupedData);
    }

    getAt(date: string, category: Category, subCategory: Category, i: number): ZMTransaction | null {
        const categoryTitle = subCategory ? subCategory.name : category.name;
        return this.groupedData?.[date]?.[categoryTitle]?.[i];
    }
}

const DV = {
    ControlButtons() {
        return <div>
            <button id="dv-vis" class="btn btn-secondary">Визуализировать</button>
            <button id="dv-load" class="btn btn-secondary">Загрузить ещё</button>
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

        const dateRange = minMax(Object.keys(dataStorage.groupedData));

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

        const tableView =
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
                                datesRangeList.map(date =>
                                    <tr>
                                        <td>{date}</td>
                                        {
                                            cats.flatMap(cat =>
                                                cat.safeSubCategories.flatMap(subcat =>
                                                    [...nts(subcat.length)].map(i => {
                                                        const operation = dataStorage.getAt(date, cat, subcat, i)

                                                        return <td title={operation?.tag_group}>
                                                            <DV.TransactionPrice transaction={operation}/>
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

/************************/
/*      ZenMoney        */
/************************/
// Data manipulation
class ZM {

    static get transactions(): ZMTransactions {
        return zm.loader.page.transaction;
    }

    static resolveTag(operation: ZMTransaction): ZMTag | null {
        const tagGroupId = operation.tag_group;

        if (tagGroupId === null) {
            return null;
        }

        const tagGroup = ZM.tagGroups[tagGroupId]

        console.assert(!!tagGroup, tagGroupId);
        console.assert(!!tagGroup.tag0, tagGroup);

        let tag = ZM.tags[tagGroup.tag0];

        console.assert(!!tag, tagGroup.tag0);

        return tag;
    }

    static get tags() {
        return zm.profile.tags;
    }

    static get tagGroups() {
        return zm.profile.tag_groups;
    }
}

// ZenMoney Data Model Definitions
declare const zm: {
    profile: {
        tags: {
            [key: number]: ZMTag
        },
        tag_groups: {
            [key: number]: ZMTagGroup
        },
        tagTree: {
            [key: number]: ZMTagTree
        }
    },
    loader: {
        page: {
            transaction: ZMTransactions
        }
    }
};

declare class ZMTagGroup {
    id: number;
    budget_income: boolean;
    budget_outcome: boolean;
    changed: string;
    show_income: boolean;
    show_outcome: boolean;
    tag0: number;
    tag1: number | null;
    tag2: number | null;
}

declare class ZMTag {
    id: number;
    autocreate_tag_group: boolean;
    budget_income: boolean;
    budget_outcome: boolean;
    changed: string;
    group: number;
    icon: string;
    lower: string;
    mgroup: number;
    parent: string;
    pgroups: number[];
    required: boolean;
    show_income: boolean;
    show_outcome: boolean;
    title: string;
}

declare class ZMTagTree extends ZMTag {
    childs: { [key: number]: ZMTag }
}

declare class ZMTransaction {
    account_income: number;
    account_outcome: number;
    category: number;
    changed: string;
    comment: string;
    created: string;
    date: string;
    deleted: boolean;
    direction: number;
    hold: boolean;
    id: number;
    inbalance_income: boolean;
    inbalance_outcome: boolean;
    income: number;
    outcome: number;
    instrument_income: number;
    instrument_outcome: number;
    merchant: Object;
    payee: string;
    price: Object;
    tag_group: number;
    tag_groups: number;
    type: number;
    type_income: string;
    type_outcome: string;
    user: number;
}

declare class ZMCache {
    el: Node;
    data: ZMTransaction;
}

declare class ZMTransactions {
    cache: { [key: number]: ZMCache };
    cacheOrder: number[];
    limit: number
    skip: number

    load()
}

/************************/
/*      Utilities       */
/************************/
// DOM Manipulation
const JSX = {

    /**
     * The tag name and create an html together with the attributes
     *
     * @param  {String} tagName name as string, e.g. 'div', 'span', 'svg'
     * @param  {Object} attrs html attributes e.g. data-, width, src
     * @param  {Array} children html nodes from inside de elements
     * @return {HTMLElement|SVGElement} html node with attrs
     */
    createElements(tagName, attrs, children) {
        const element = JSX.isSVG(tagName)
            ? document.createElementNS('http://www.w3.org/2000/svg', tagName)
            : document.createElement(tagName)

        // one or multiple will be evaluated to append as string or HTMLElement
        const fragment = JSX.createFragmentFrom(children)
        element.appendChild(fragment)

        Object.keys(attrs || {}).forEach(prop => {
            if (prop === 'style' && typeof attrs.style === 'object') {
                // e.g. origin: <element style={{ prop: value }} />
                Object.assign(element.style, attrs[prop])
            } else if (prop === 'ref' && typeof attrs.ref === 'function') {
                attrs.ref(element, attrs)
            } else if (prop === 'class') {
                attrs.class.split(/\s+/).forEach(className => {
                    element.classList.add(className);
                });
            } else if (prop === 'htmlFor') {
                element.setAttribute('for', attrs[prop])
            } else if (prop === 'xlinkHref') {
                element.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', attrs[prop])
            } else if (prop === 'dangerouslySetInnerHTML') {
                // eslint-disable-next-line no-underscore-dangle
                element.innerHTML = attrs[prop].__html
            } else {
                // any other prop will be set as attribute
                element.setAttribute(prop, attrs[prop])
            }
        })

        return element
    },

    /**
     * The JSXTag will be unwrapped returning the html
     *
     * @param  {Function} JSXTag name as string, e.g. 'div', 'span', 'svg'
     * @param  {Object} elementProps custom jsx attributes e.g. fn, strings
     * @param  {Array} children html nodes from inside de elements
     *
     * @return {Function} returns de 'dom' (fn) executed, leaving the HTMLElement
     *
     * JSXTag:  function Comp(props) {
     *   return dom("span", null, props.num);
     * }
     */
    composeToFunction(JSXTag, elementProps, children) {
        const props = Object.assign({}, JSXTag.defaultProps || {}, elementProps, {children})
        const bridge = JSXTag.prototype?.render ? new JSXTag(props).render : JSXTag
        const result = bridge(props)

        switch (result) {
            case 'FRAGMENT':
                return JSX.createFragmentFrom(children)

            // Portals are useful to render modals
            // allow render on a different element than the parent of the chain
            // and leave a comment instead
            case 'PORTAL':
                bridge.target.appendChild(JSX.createFragmentFrom(children))
                return document.createComment('Portal Used')
            default:
                return result
        }
    },

    dom(element, attrs, ...children) {
        // Custom Components will be functions
        if (typeof element === 'function') {
            // e.g. const CustomTag = ({ w }) => <span width={w} />
            // will be used
            // e.g. <CustomTag w={1} />
            // becomes: CustomTag({ w: 1})
            return JSX.composeToFunction(element, attrs, children)
        }

        // regular html components will be strings to create the elements
        // this is handled by the babel plugins
        if (typeof element === 'string') {
            return JSX.createElements(element, attrs, children)
        }

        return console.error(`jsx-render does not handle ${typeof element}`)
    },

    isSVG(element) {
        const patt = new RegExp(`^${element}$`, 'i')
        const SVGTags = ['path', 'svg', 'use', 'g']

        return SVGTags.some(tag => patt.test(tag))
    },

    createFragmentFrom(children) {
        // fragments will help later to append multiple children to the initial node
        const fragment = document.createDocumentFragment()

        function processDOMNodes(child) {
            if (
                child instanceof HTMLElement ||
                child instanceof SVGElement ||
                child instanceof Comment ||
                child instanceof DocumentFragment
            ) {
                fragment.appendChild(child)
            } else if (typeof child === 'string' || typeof child === 'number') {
                const textnode = document.createTextNode(child.toString())
                fragment.appendChild(textnode)
            } else if (child instanceof Array) {
                child.forEach(processDOMNodes)
            } else if (child === false || child === null) {
                // expression evaluated as false e.g. {false && <Elem />}
                // expression evaluated as false e.g. {null && <Elem />}
            } else {
                // later other things could not be HTMLElement nor strings
            }
        }

        children.forEach(processDOMNodes)

        return fragment
    }
}

// Useful stuff
function minMax<T>(items: T[]): { min: T, max: T } {
    const list = [...items].sort();

    const min = list[0];
    const max = list[list.length - 1];

    return {min, max};
}

function* nts(count: number): Generator<number> {
    for (let i = 0; i < count; i++) {
        yield i;
    }
}

function datesRange(start: Date, end: Date): Date[] {
    let arr = [];
    let dt = new Date(start);
    for (; dt <= end; dt.setDate(dt.getDate() + 1)) {
        arr.push(new Date(dt));
    }
    return arr;
}

interface Map<K, V> {
    mapValues<T>(mapFn: (key: K, value: V) => T): Map<K, T>;
}

Map.prototype.mapValues = function (mapFn: (key, value) => any) {
    const map = new Map();

    for (let [key, value] of this.entries()) {
        map.set(key, mapFn(key, value));
    }

    return map;
};

interface Array<T> {
    groupBy<K>(keyFn: (v: T) => K): Map<K, T[]>
}

Array.prototype.groupBy = function (keyFn): Map<any, any[]> {
    return this.reduce((acc: Map<any, any[]>, it) => {
        acc.set(keyFn(it), [...acc.get(keyFn(it)) || [], keyFn(it)]);
        return acc;
    }, new Map());
}