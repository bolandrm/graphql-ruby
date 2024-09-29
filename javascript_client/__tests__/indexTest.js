"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const child_process_1 = __importDefault(require("child_process"));
describe("root module", () => {
    it("exports the sync function", () => {
        expect(index_1.sync).toBeInstanceOf(Function);
    });
    it("exports things at root level", () => {
        // Make sure that the compiled JavaScript
        // has all the expected exports.
        var testScript = "var client = require('./index'); console.log(JSON.stringify({ keys: Object.keys(client).sort() }))";
        var output = child_process_1.default.execSync("node -e \"" + testScript + "\"");
        var outputData = JSON.parse(output.toString());
        var expectedKeys = [
            "AblyLink",
            "ActionCableLink",
            "PusherLink",
            "addGraphQLSubscriptions",
            "createRelaySubscriptionHandler",
            "generateClient",
            "sync"
        ];
        expect(outputData.keys).toEqual(expectedKeys);
    });
});
