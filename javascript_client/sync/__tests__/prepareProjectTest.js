"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prepareProject_1 = __importDefault(require("../prepareProject"));
describe("merging a project", () => {
    it("builds out separate operations", () => {
        var filenames = [
            "./src/__tests__/project/op_2.graphql",
            "./src/__tests__/project/op_1.graphql",
            "./src/__tests__/project/frag_1.graphql",
            "./src/__tests__/project/frag_2.graphql",
            "./src/__tests__/project/frag_3.graphql",
        ];
        var ops = (0, prepareProject_1.default)(filenames, false);
        expect(ops).toMatchSnapshot();
    });
    describe("with --add-typename", () => {
        it("builds out operation with __typename fields", () => {
            var filenames = [
                "./src/__tests__/project/op_3.graphql",
                "./src/__tests__/project/frag_2.graphql",
                "./src/__tests__/project/frag_3.graphql",
                "./src/__tests__/project/frag_4.graphql",
            ];
            var ops = (0, prepareProject_1.default)(filenames, true);
            expect(ops).toMatchSnapshot();
        });
    });
    it("blows up on duplicate names", () => {
        var filenames = [
            "./src/__tests__/documents/doc1.graphql",
            "./src/__tests__/project/op_2.graphql",
            "./src/__tests__/project/op_1.graphql",
            "./src/__tests__/project/frag_1.graphql",
        ];
        expect(() => {
            (0, prepareProject_1.default)(filenames, false);
        }).toThrow("Found duplicate definition name: GetStuff, fragment & operation names must be unique to sync");
    });
});
