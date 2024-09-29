"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PusherLink_1 = __importDefault(require("../PusherLink"));
const graphql_1 = require("graphql");
const pusher_js_1 = __importDefault(require("pusher-js"));
const pako_1 = __importDefault(require("pako"));
describe("PusherLink", () => {
    var channelName = "abcd-efgh";
    var log;
    var pusher;
    var options;
    var link;
    var query;
    var operation;
    beforeEach(() => {
        log = [];
        pusher = {
            _channels: {},
            trigger: function (channel, event, data) {
                var handlers = this._channels[channel];
                if (handlers) {
                    handlers.forEach(function (handler) {
                        if (handler[0] == event) {
                            handler[1](data);
                        }
                    });
                }
            },
            subscribe: function (channel) {
                log.push(["subscribe", channel]);
                var handlers = this._channels[channel];
                if (!handlers) {
                    handlers = this._channels[channel] = [];
                }
                return {
                    bind: (action, handler) => {
                        handlers.push([action, handler]);
                    }
                };
            },
            unsubscribe: (channel) => {
                log.push(["unsubscribe", channel]);
            },
        };
        options = {
            pusher: pusher
        };
        link = new PusherLink_1.default(options);
        query = (0, graphql_1.parse)("subscription { foo { bar } }");
        operation = {
            query: query,
            variables: { a: 1 },
            operationId: "operationId",
            operationName: "operationName",
            getContext: () => {
                return {
                    response: {
                        headers: {
                            get: (headerName) => {
                                if (headerName == "X-Subscription-ID") {
                                    return channelName;
                                }
                                else {
                                    throw "Unsupported header name: " + headerName;
                                }
                            }
                        }
                    }
                };
            }
        };
    });
    it("forwards errors to error handlers", () => {
        let passedErrorHandler = () => { };
        var observable = link.request(operation, function (_operation) {
            return {
                subscribe: (options) => {
                    passedErrorHandler = options.error;
                    { }
                }
            };
        });
        let errorHandlerWasCalled = false;
        function createdErrorHandler(_err) {
            errorHandlerWasCalled = true;
        }
        observable.subscribe(function (result) {
            log.push(["received", result]);
        }, createdErrorHandler);
        if (passedErrorHandler) {
            passedErrorHandler(new Error);
        }
        expect(errorHandlerWasCalled).toBe(true);
    });
    it("doesn't call the link request's `complete` handler because otherwise Apollo would clean up subscriptions", () => {
        let passedComplete = () => { };
        var observable = link.request(operation, function (_operation) {
            return {
                subscribe: (options) => {
                    passedComplete = options.complete;
                    { }
                }
            };
        });
        observable.subscribe(function (result) {
            log.push(["received", result]);
        }, null, function () { log.push(["completed"]); });
        expect(log).toEqual([]);
        expect(passedComplete).toBeUndefined();
    });
    it("delegates to pusher", () => {
        var requestFinished = () => { };
        var observable = link.request(operation, function (_operation) {
            return {
                subscribe: (options) => {
                    requestFinished = options.next;
                }
            };
        });
        // unpack the underlying subscription
        observable.subscribe(function (result) {
            log.push(["received", result]);
        });
        // Pretend the HTTP link finished
        requestFinished({ data: "initial payload" });
        pusher.trigger(channelName, "update", {
            result: {
                data: "data 1"
            },
            more: true
        });
        pusher.trigger(channelName, "update", {
            result: {
                data: "data 2"
            },
            more: false
        });
        expect(log).toEqual([
            ["subscribe", "abcd-efgh"],
            ["received", { data: "initial payload" }],
            ["received", { data: "data 1" }],
            ["received", { data: "data 2" }],
            ["unsubscribe", "abcd-efgh"]
        ]);
    });
    it("delegates a manual unsubscribe to pusher", () => {
        var requestFinished = () => { };
        var observable = link.request(operation, function (_operation) {
            return {
                subscribe: (options) => {
                    requestFinished = options.next;
                }
            };
        });
        // unpack the underlying subscription
        var subscription = observable.subscribe(function (result) {
            log.push(["received", result]);
        });
        // Pretend the HTTP link finished
        requestFinished({ data: "initial payload" });
        pusher.trigger(channelName, "update", {
            result: {
                data: "data 1"
            },
            more: true
        });
        subscription.unsubscribe();
        expect(log).toEqual([
            ["subscribe", "abcd-efgh"],
            ["received", { data: "initial payload" }],
            ["received", { data: "data 1" }],
            ["unsubscribe", "abcd-efgh"]
        ]);
    });
    it("doesn't send empty initial responses", () => {
        var requestFinished = () => { };
        var observable = link.request(operation, function (_operation) {
            return {
                subscribe: (options) => {
                    requestFinished = options.next;
                }
            };
        });
        // unpack the underlying subscription
        var subscription = observable.subscribe(function (result) {
            log.push(["received", result]);
        });
        // Pretend the HTTP link finished
        requestFinished({ data: null });
        pusher.trigger(channelName, "update", {
            result: {
                data: "data 1"
            },
            more: true
        });
        subscription.unsubscribe();
        expect(log).toEqual([
            ["subscribe", "abcd-efgh"],
            ["received", { data: "data 1" }],
            ["unsubscribe", "abcd-efgh"]
        ]);
    });
    it("throws an error when no `decompress:` is configured", () => {
        const link = new PusherLink_1.default({
            pusher: new pusher_js_1.default("123"),
        });
        const observer = {
            next: (_result) => { },
            complete: () => { },
        };
        const payload = {
            more: true,
            compressed_result: "abcdef",
        };
        expect(() => {
            link._onUpdate("abc", observer, payload);
        }).toThrow("Received compressed_result but PusherLink wasn't configured with `decompress: (result: string) => any`. Add this configuration.");
    });
    it("decompresses compressed_result", () => {
        const link = new PusherLink_1.default({
            pusher: new pusher_js_1.default("123"),
            decompress: (compressed) => {
                const buff = Buffer.from(compressed, 'base64');
                return JSON.parse(pako_1.default.inflate(buff, { to: 'string' }));
            },
        });
        const results = [];
        const observer = {
            next: (result) => { results.push(result); },
            complete: () => { results.push("complete"); },
        };
        const compressedData = pako_1.default.deflate(JSON.stringify({ a: 1, b: 2 }));
        // Browsers have `TextEncoder` for this
        const compressedStr = Buffer.from(compressedData).toString("base64");
        const payload = {
            more: true,
            compressed_result: compressedStr,
        };
        // Send a dummy payload and then terminate the subscription
        link._onUpdate("abc", observer, payload);
        link._onUpdate("abc", observer, { more: false });
        expect(results).toEqual([{ a: 1, b: 2 }, "complete"]);
    });
});
