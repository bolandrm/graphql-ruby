"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const addTypenameToSelectionSet_1 = require("../addTypenameToSelectionSet");
const graphql_1 = require("graphql");
describe("adding typename", () => {
    it("adds to fields and inline fragments", () => {
        var doc = (0, graphql_1.parse)("{ a { b ... { c } } }");
        var newDoc = (0, addTypenameToSelectionSet_1.addTypenameToSelectionSet)(doc);
        var newString = (0, graphql_1.print)(newDoc).replace(/\s+/g, " ").trim();
        expect(newString).toEqual("{ a { b ... { c __typename } __typename } }");
    });
});
