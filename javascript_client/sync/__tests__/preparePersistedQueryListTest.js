"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const preparePersistedQueryList_1 = __importDefault(require("../preparePersistedQueryList"));
it("reads generate-persisted-query-manifest output", () => {
    const manifestPath = "./src/sync/__tests__/generate-persisted-query-manifest.json";
    var ops = (0, preparePersistedQueryList_1.default)(manifestPath);
    expect(ops).toMatchSnapshot();
});
