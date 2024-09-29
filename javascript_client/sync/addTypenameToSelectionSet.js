"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTypenameIfAbsent = exports.addTypenameToSelectionSet = void 0;
const graphql_1 = require("graphql");
const TYPENAME_FIELD = {
    kind: graphql_1.Kind.FIELD,
    name: {
        kind: graphql_1.Kind.NAME,
        value: "__typename",
    },
    selectionSet: {
        kind: graphql_1.Kind.SELECTION_SET,
        selections: []
    }
};
function addTypenameIfAbsent(node) {
    if (node.selectionSet) {
        const alreadyHasThisField = node.selectionSet.selections.some(function (selection) {
            return (selection.kind === "Field" && selection.name.value === "__typename");
        });
        if (!alreadyHasThisField) {
            return Object.assign(Object.assign({}, node), { selectionSet: Object.assign(Object.assign({}, node.selectionSet), { selections: [...node.selectionSet.selections, TYPENAME_FIELD] }) });
        }
        else {
            return undefined;
        }
    }
    else {
        return undefined;
    }
}
exports.addTypenameIfAbsent = addTypenameIfAbsent;
function addTypenameToSelectionSet(node) {
    var visitor = {
        Field: {
            leave: addTypenameIfAbsent,
        },
        InlineFragment: {
            leave: addTypenameIfAbsent,
        }
    };
    var newNode = (0, graphql_1.visit)(node, visitor);
    return newNode;
}
exports.addTypenameToSelectionSet = addTypenameToSelectionSet;
