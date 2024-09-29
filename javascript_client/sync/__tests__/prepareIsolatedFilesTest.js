"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prepareIsolatedFiles_1 = __importDefault(require("../prepareIsolatedFiles"));
it("builds out single operations", () => {
    var filenames = [
        "./src/__tests__/project/op_isolated_1.graphql",
        "./src/__tests__/project/op_isolated_2.graphql",
    ];
    var ops = (0, prepareIsolatedFiles_1.default)(filenames, false);
    expect(ops).toMatchSnapshot();
});
describe("with --add-typename", () => {
    it("builds out single operations with __typename fields", () => {
        var filenames = [
            "./src/__tests__/project/op_isolated_1.graphql",
            "./src/__tests__/project/op_isolated_2.graphql",
        ];
        var ops = (0, prepareIsolatedFiles_1.default)(filenames, true);
        expect(ops).toMatchSnapshot();
    });
});
