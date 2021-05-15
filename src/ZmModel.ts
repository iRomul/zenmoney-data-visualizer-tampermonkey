import {Category} from "./Category";

export declare class ZMTagGroup {
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

export declare class ZMTag {
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

export declare class ZMTagTree extends ZMTag {
    childs: { [key: number]: ZMTag }
}

export declare class ZMTransaction {
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

export declare class ZMCache {
    el: Node;
    data: ZMTransaction;
}

export declare class ZMTransactions {
    cache: { [key: number]: ZMCache };
    cacheOrder: number[];
    limit: number
    skip: number

    load()
}

