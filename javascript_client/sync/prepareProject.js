"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addTypenameToSelectionSet_1 = require("./addTypenameToSelectionSet");
const fs_1 = __importDefault(require("fs"));
const graphql_1 = require("graphql");
const removeClientFields_1 = require("./removeClientFields");
/**
 * Take a whole bunch of GraphQL in one big string
 * and validate it, especially:
 *
 * - operation names are unique
 * - fragment names are unique
 *
 * Then, split each operation into a free-standing document,
 * so it has all the fragments it needs.
 */
function prepareProject(filenames, addTypename) {
    if (!filenames.length) {
        return [];
    }
    var allGraphQL = "";
    filenames.forEach(function (filename) {
        allGraphQL += fs_1.default.readFileSync(filename);
    });
    var ast = (0, graphql_1.parse)(allGraphQL);
    // This will contain { name: [name, name] } pairs
    var definitionDependencyNames = {};
    var allOperationNames = [];
    var currentDependencyNames = null;
    // When entering a fragment or operation,
    // start recording its dependencies
    var enterDefinition = function (node) {
        // Technically, it could be an anonymous definition
        if (node.name) {
            var definitionName = node.name.value;
            if (definitionDependencyNames[definitionName]) {
                throw new Error("Found duplicate definition name: " + definitionName + ", fragment & operation names must be unique to sync");
            }
            else {
                currentDependencyNames = definitionDependencyNames[definitionName] = [];
            }
        }
    };
    var visitor = {
        OperationDefinition: {
            enter: function (node) {
                enterDefinition(node);
                node.name && allOperationNames.push(node.name.value);
            },
        },
        FragmentDefinition: {
            enter: enterDefinition,
        },
        // When entering a fragment spread, register it as a
        // dependency of its context
        FragmentSpread: {
            enter: function (node) {
                currentDependencyNames.push(node.name.value);
            }
        },
        Field: {
            leave: addTypename ? addTypenameToSelectionSet_1.addTypenameIfAbsent : () => { }
        },
        InlineFragment: {
            leave: addTypename ? addTypenameToSelectionSet_1.addTypenameIfAbsent : () => { }
        }
    };
    // Find the dependencies, build the accumulator
    ast = (0, graphql_1.visit)(ast, visitor);
    ast = (0, removeClientFields_1.removeClientFields)(ast);
    // For each operation, build a separate document of that operation and its deps
    // then print the new document to a string
    var operations = allOperationNames.map(function (operationName) {
        var visitedDepNames = [];
        var depNamesToVisit = [operationName];
        var depName;
        while (depNamesToVisit.length > 0) {
            depName = depNamesToVisit.shift();
            if (depName) {
                visitedDepNames.push(depName);
                definitionDependencyNames[depName].forEach(function (nextDepName) {
                    if (visitedDepNames.indexOf(nextDepName) === -1) {
                        depNamesToVisit.push(nextDepName);
                    }
                });
            }
        }
        var newAST = extractDefinitions(ast, visitedDepNames);
        return {
            name: operationName,
            body: (0, graphql_1.print)(newAST),
            alias: "", // will be filled in later, when hashFunc is available
        };
    });
    return operations;
}
// Return a new AST which contains only `definitionNames`
function extractDefinitions(ast, definitionNames) {
    var removeDefinitionNode = function (node) {
        if (node.name && definitionNames.indexOf(node.name.value) === -1) {
            return null;
        }
        else {
            return undefined;
        }
    };
    var visitor = {
        OperationDefinition: removeDefinitionNode,
        FragmentDefinition: removeDefinitionNode,
    };
    var newAST = (0, graphql_1.visit)(ast, visitor);
    return newAST;
}
exports.default = prepareProject;
