import {ZMTag, ZMTagGroup, ZMTagTree, ZMTransaction, ZMTransactions} from "./ZmModel";

export class ZM {

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

export declare const zm: {
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