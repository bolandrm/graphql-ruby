"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
// Transform the output from generate-persisted-query-manifest
// to something that OperationStore `sync` can use.
function preparePersistedQueryList(pqlPath) {
    const pqlString = fs_1.default.readFileSync(pqlPath, "utf8");
    const pqlJson = JSON.parse(pqlString);
    return pqlJson.operations.map(function (persistedQueryConfig) {
        return {
            body: persistedQueryConfig.body,
            alias: persistedQueryConfig.id,
            name: persistedQueryConfig.name
        };
    });
}
exports.default = preparePersistedQueryList;
