"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sync_1 = __importDefault(require("../sync"));
var fs = require("fs");
var nock = require("nock");
describe("sync operations", () => {
    beforeEach(() => {
        global.console.error = jest.fn();
        global.console.log = jest.fn();
        if (fs.existsSync("./src/OperationStoreClient.js")) {
            fs.unlinkSync("./src/OperationStoreClient.js");
        }
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe("generating artifacts without syncing", () => {
        it("works without a URL", () => {
            var options = {
                client: "test-1",
                path: "./src/__tests__/documents",
            };
            return (0, sync_1.default)(options).then(function () {
                var generatedCode = fs.readFileSync("./src/OperationStoreClient.js", "utf8");
                expect(generatedCode).toMatch('"GetStuff": "b8086942c2fbb6ac69b97cbade848033"');
                expect(generatedCode).toMatchSnapshot();
            });
        });
        it("works with persisted query manifest", () => {
            var options = {
                client: "test-1",
                outfile: "./src/OperationStoreClient.js",
                apolloPersistedQueryManifest: "./src/sync/__tests__/generate-persisted-query-manifest.json",
            };
            return (0, sync_1.default)(options).then(function () {
                var generatedCode = fs.readFileSync("./src/OperationStoreClient.js", "utf8");
                expect(generatedCode).toMatch('"TestQuery2": "xyz-123"');
                expect(generatedCode).toMatchSnapshot();
            });
        });
    });
    describe("custom HTTP options", () => {
        it("uses the provided `send` option & provided URL", () => {
            var url;
            var options = {
                client: "test-1",
                path: "./src/__tests__/documents",
                url: "bogus",
                headers: {
                    "X-Something-Special": "🎂",
                },
                changesetVersion: "2023-05-05",
                quiet: true,
                send: (_sendPayload, options) => {
                    url = options.url;
                    Object.keys(options.headers).forEach((h) => {
                        url += "?" + h + "=" + options.headers[h];
                    });
                    url += "&changesetVersion=" + options.changesetVersion;
                },
            };
            return (0, sync_1.default)(options).then(function () {
                expect(url).toEqual("bogus?X-Something-Special=🎂&changesetVersion=2023-05-05");
            });
        });
    });
    describe("verbose", () => {
        it("Adds debug output", () => {
            var spy = console.log;
            var options = {
                client: "test-1",
                path: "./src/__tests__/documents",
                url: "bogus",
                verbose: true,
                send: (_sendPayload, opts) => {
                    opts.logger.log("Verbose!");
                },
            };
            return (0, sync_1.default)(options).then(function () {
                expect(spy.mock.calls).toMatchSnapshot();
            });
        });
    });
    describe("custom file processing options", () => {
        it("Adds .graphql to the glob if needed", () => {
            var payload;
            var options = {
                client: "test-1",
                path: "./src/__tests__/documents",
                url: "bogus",
                quiet: true,
                send: (sendPayload, _opts) => { payload = sendPayload; },
            };
            return (0, sync_1.default)(options).then(function () {
                expect(payload.operations).toMatchSnapshot();
                var optionsWithExt = Object.assign(Object.assign({}, options), { glob: "./**/*.graphql" });
                return (0, sync_1.default)(optionsWithExt).then(function () {
                    // Get the same result, even when the glob already has a file extension
                    expect(payload.operations).toMatchSnapshot();
                });
            });
        });
        it("Uses a custom hash function if provided", () => {
            var payload;
            var options = {
                client: "test-1",
                path: "./src/__tests__/documents",
                url: "bogus",
                quiet: true,
                hash: (graphQLBody) => {
                    // This is a bad hack to get the operation name
                    var opName = graphQLBody.match(/query ([A-Za-z]+) \{/);
                    return opName ? opName[1].toUpperCase() : null;
                },
                send: (sendPayload, _opts) => { payload = sendPayload; },
            };
            return (0, sync_1.default)(options).then(function () {
                expect(payload.operations).toMatchSnapshot();
            });
        });
    });
    describe("Relay support", () => {
        it("Uses Relay generated .js files", () => {
            var payload;
            var options = {
                client: "test-1",
                quiet: true,
                path: "./src/__generated__",
                url: "bogus",
                send: (sendPayload, _opts) => { payload = sendPayload; },
            };
            return (0, sync_1.default)(options).then(function () {
                expect(payload.operations).toMatchSnapshot();
            });
        });
        it("Uses relay --persist-output JSON files", () => {
            var payload;
            var options = {
                client: "test-1",
                quiet: true,
                relayPersistedOutput: "./src/__tests__/example-relay-persisted-queries.json",
                url: "bogus",
                send: (sendPayload, _opts) => {
                    payload = sendPayload;
                },
            };
            return (0, sync_1.default)(options).then(function () {
                return expect(payload.operations).toMatchSnapshot();
            });
        });
        it("Uses Apollo Android OperationOutput JSON files", () => {
            var payload;
            var options = {
                client: "test-1",
                quiet: true,
                apolloAndroidOperationOutput: "./src/__tests__/example-apollo-android-operation-output.json",
                url: "bogus",
                send: (sendPayload, _opts) => {
                    payload = sendPayload;
                },
            };
            return (0, sync_1.default)(options).then(function () {
                expect(payload.operations[0].alias).toEqual("aba626ea9bdf465954e89e5590eb2c1a");
                return expect(payload.operations).toMatchSnapshot();
            });
        });
        it("Uses Apollo Codegen JSON files", () => {
            var payload;
            var options = {
                client: "test-1",
                quiet: true,
                apolloCodegenJsonOutput: "./src/__tests__/apolloExample/gen/output.json",
                url: "bogus",
                send: (sendPayload, _opts) => {
                    payload = sendPayload;
                },
            };
            return (0, sync_1.default)(options).then(function () {
                expect(payload.operations[0].alias).toEqual("22cc98c61c1402c92b230b7c515e07eb793a5152c388b015e86df4652ec58156");
                return expect(payload.operations).toMatchSnapshot();
            });
        });
    });
    describe("Input files", () => {
        it("Merges fragments and operations across files", () => {
            var payload;
            var options = {
                client: "test-1",
                quiet: true,
                path: "./src/__tests__/project/",
                url: "bogus",
                // mode: "project" is the default
                send: (sendPayload, _opts) => { payload = sendPayload; },
            };
            return (0, sync_1.default)(options).then(function () {
                expect(payload.operations).toMatchSnapshot();
            });
        });
        it("Uses mode: file to process each file separately", () => {
            var payload;
            var options = {
                client: "test-1",
                quiet: true,
                path: "./src/__tests__/project",
                url: "bogus",
                mode: "file",
                send: (sendPayload, _opts) => { payload = sendPayload; },
            };
            return (0, sync_1.default)(options).then(function () {
                expect(payload.operations).toMatchSnapshot();
            });
        });
    });
    describe("Promise result", () => {
        it("Yields the payload and generated code", () => {
            var options = {
                client: "test-1",
                path: "./src/__tests__/project",
                url: "bogus",
                quiet: true,
                send: () => { },
            };
            return (0, sync_1.default)(options).then(function (ppayload) {
                var payload = ppayload;
                expect(payload.operations.length).toEqual(5);
                var generatedCode = fs.readFileSync("./src/OperationStoreClient.js", "utf8");
                expect(payload.generatedCode).toEqual(generatedCode);
                fs.unlinkSync("./src/OperationStoreClient.js");
            });
        });
    });
    describe("Sync output", () => {
        it("Generates a usable artifact for middleware", () => {
            var options = {
                client: "test-1",
                path: "./src/__tests__/project",
                url: "bogus",
                quiet: true,
                send: () => { },
            };
            return (0, sync_1.default)(options).then(function () {
                var generatedCode = fs.readFileSync("./src/OperationStoreClient.js", "utf8");
                expect(generatedCode).toMatch('"GetStuff": "4568c28d403794e011363caf815ec827"');
                expect(generatedCode).toMatch('module.exports = OperationStoreClient');
                expect(generatedCode).toMatch('var _client = "test-1"');
                fs.unlinkSync("./src/OperationStoreClient.js");
            });
        });
        it("Takes an outfile option", () => {
            var options = {
                client: "test-2",
                path: "./src/__tests__/project",
                url: "bogus",
                quiet: true,
                outfile: "__crazy_outfile.js",
                send: () => { },
            };
            return (0, sync_1.default)(options).then(function () {
                var generatedCode = fs.readFileSync("./__crazy_outfile.js", "utf8");
                expect(generatedCode).toMatch('"GetStuff": "4568c28d403794e011363caf815ec827"');
                expect(generatedCode).toMatch('module.exports = OperationStoreClient');
                expect(generatedCode).toMatch('var _client = "test-2"');
                fs.unlinkSync("./__crazy_outfile.js");
            });
        });
        it("Skips outfile generation when using --persist-output artifact", () => {
            var options = {
                client: "test-2",
                relayPersistedOutput: "./src/__tests__/example-relay-persisted-queries.json",
                url: "bogus",
                quiet: true,
                send: () => { },
            };
            return (0, sync_1.default)(options).then(function () {
                // This is the default outfile:
                var wasWritten = fs.existsSync("./src/OperationStoreClient.js");
                expect(wasWritten).toBe(false);
            });
        });
        it("Skips outfile generation when using --apollo-android-operation-output artifact", () => {
            var options = {
                client: "test-2",
                apolloAndroidOperationOutput: "./src/__tests__/example-apollo-android-operation-output.json",
                url: "bogus",
                quiet: true,
                send: () => { },
            };
            return (0, sync_1.default)(options).then(function () {
                // This is the default outfile:
                var wasWritten = fs.existsSync("./src/OperationStoreClient.js");
                expect(wasWritten).toBe(false);
            });
        });
    });
    describe("Logging", () => {
        it("Logs progress", () => {
            var spy = console.log;
            var options = {
                client: "test-1",
                path: "./src/__tests__/project",
                url: "bogus",
                send: () => { },
            };
            return (0, sync_1.default)(options).then(function () {
                expect(spy.mock.calls).toMatchSnapshot();
            });
        });
        it("Can be quieted with quiet: true", () => {
            var spy = console.log;
            var options = {
                client: "test-1",
                path: "./src/__tests__/project",
                url: "bogus",
                quiet: true,
                send: () => { },
            };
            return (0, sync_1.default)(options).then(function () {
                expect(spy.mock.calls).toMatchSnapshot();
            });
        });
    });
    describe("Printing the result", () => {
        function buildMockRespondingWith(status, data) {
            return nock("http://example.com").post("/stored_operations/sync").reply(status, data);
        }
        it("prints failure and sends the message to the promise", () => {
            var spyConsoleLog = console.log;
            var spyConsoleError = console.error;
            buildMockRespondingWith(422, {
                errors: { "4568c28d403794e011363caf815ec827": ["something"] },
                failed: ["4568c28d403794e011363caf815ec827"],
                added: ["defg"],
                not_modified: [],
            });
            var options = {
                client: "test-1",
                path: "./src/__tests__/project",
                url: "http://example.com/stored_operations/sync",
                quiet: false,
            };
            var syncPromise = (0, sync_1.default)(options);
            return syncPromise.catch((errmsg) => {
                expect(errmsg).toEqual("Sync failed: GetStuff: something");
                expect(spyConsoleLog.mock.calls).toMatchSnapshot();
                expect(spyConsoleError.mock.calls).toMatchSnapshot();
                jest.clearAllMocks();
            });
        });
        it("prints success", () => {
            var spyConsoleLog = console.log;
            var spyConsoleError = console.error;
            buildMockRespondingWith(422, {
                errors: {},
                failed: [],
                added: ["defg"],
                not_modified: ["xyz", "123"],
            });
            var options = {
                client: "test-1",
                path: "./src/__tests__/project",
                url: "http://example.com/stored_operations/sync",
                quiet: false,
            };
            var syncPromise = (0, sync_1.default)(options);
            expect(spyConsoleLog.mock.calls).toMatchSnapshot();
            jest.clearAllMocks();
            return syncPromise.then(() => {
                expect(spyConsoleLog.mock.calls).toMatchSnapshot();
                expect(spyConsoleError.mock.calls).toMatchSnapshot();
                jest.clearAllMocks();
            });
        });
    });
});
