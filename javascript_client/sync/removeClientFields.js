"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeClientFieldsFromString = exports.removeClientFields = void 0;
const graphql_1 = require("graphql");
function removeClientFields(node) {
    // Deleting fields can create invalid documents:
    // - If variables were used by those fields (or their subfields), then their definitions are invalid
    // - If a fragment contained only deleted fields, it is now empty and therefore invalid and should be deleted
    // - If a fragment spread names a deleted fragment, it is now invalid
    // - If a client field contained a fragment spread and it's deleted, then a fragment may be left unspread
    let anythingWasRemoved = false;
    const usedVariables = [];
    let definedFragments = [];
    let spreadFragments = [];
    // First pass: remove as much as possible, even if the document is left invalid.
    // - remove fields that have @client
    // - remove fragment definitions that become empty
    let newDoc = (0, graphql_1.visit)(node, {
        Field: {
            enter: (node) => {
                if (node.directives && node.directives.some((d) => { return d.name.value === "client"; })) {
                    anythingWasRemoved = true;
                    // Delete this node
                    return null;
                }
                else {
                    return undefined;
                }
            }
        },
        // FragmentSpread: ... Don't do this now, because we might find some in Fragment Definitions that are deleted later.
        FragmentDefinition: {
            leave: (node) => {
                if (node.selectionSet.selections.length == 0) {
                    // All the fields in this fragment were removed
                    return null;
                }
                else {
                    definedFragments.push(node.name.value);
                    return undefined;
                }
            }
        },
        FragmentSpread: {
            enter: (node) => {
                spreadFragments.push(node.name.value);
            }
        },
        Variable: {
            enter: (node, _key, parent) => {
                if (parent.kind !== 'VariableDefinition') {
                    // This will only find variables that are used _after_ `@client` fields are deleted.
                    // (If `@client` fields are deleted, then their arguments aren't visited)
                    usedVariables.push(node.name.value);
                }
            },
        },
    });
    if (anythingWasRemoved) {
        // At this point, we can remove variables that aren't used.
        newDoc = (0, graphql_1.visit)(newDoc, {
            VariableDefinition: {
                enter: (node) => {
                    if (!usedVariables.includes(node.variable.name.value)) {
                        return null;
                    }
                    else {
                        return undefined;
                    }
                }
            },
        });
        // Then, remove spreads of empty fragment definitions as long as we keep finding them
        // Also remove definitions of fragments that aren't spread anymore
        while (anythingWasRemoved) {
            let previouslyDefinedFragments = definedFragments;
            let previouslySpreadFragments = spreadFragments;
            definedFragments = [];
            spreadFragments = [];
            anythingWasRemoved = false;
            newDoc = (0, graphql_1.visit)(newDoc, {
                FragmentSpread: {
                    enter: (node) => {
                        if (!previouslyDefinedFragments.includes(node.name.value)) {
                            anythingWasRemoved = true;
                            return null;
                        }
                        else {
                            spreadFragments.push(node.name.value);
                            return undefined;
                        }
                    }
                },
                FragmentDefinition: {
                    enter: (node) => {
                        if (node.selectionSet.selections.length == 0 || !previouslySpreadFragments.includes(node.name.value)) {
                            anythingWasRemoved = true;
                            return null;
                        }
                        else {
                            definedFragments.push(node.name.value);
                            return undefined;
                        }
                    }
                }
            });
        }
    }
    return newDoc;
}
exports.removeClientFields = removeClientFields;
function removeClientFieldsFromString(body) {
    if (body.includes("@client")) {
        const ast = (0, graphql_1.parse)(body);
        const newAst = removeClientFields(ast);
        return (0, graphql_1.print)(newAst);
    }
    else {
        return body;
    }
}
exports.removeClientFieldsFromString = removeClientFieldsFromString;
