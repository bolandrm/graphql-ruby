"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SubscriptionExchange_1 = __importDefault(require("../SubscriptionExchange"));
const graphql_1 = require("graphql");
const process_1 = require("process");
describe("SubscriptionExchange with Pusher", () => {
    var channelName = "1234";
    var log;
    var pusher;
    var options;
    var pusherExchange;
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
                delete pusher._channels[channel];
                log.push(["unsubscribe", channel]);
            },
        };
        options = {
            pusher: pusher
        };
        pusherExchange = SubscriptionExchange_1.default.create(options);
        operation = {
            query: (0, graphql_1.parse)("{ foo { bar } }"),
            variables: {},
            key: Number(channelName),
            context: {
                url: "/graphql",
                requestPolicy: "network-only",
                fetch: () => {
                    var headers = new Headers;
                    headers.append("X-Subscription-ID", channelName);
                    const jsonData = { data: { foo: "bar" } };
                    return Promise.resolve({
                        headers: headers,
                        json: () => { return jsonData; }
                    });
                }
            },
            kind: "subscription",
        };
    });
    it("calls through to handlers and can be unsubscribed", () => {
        const subscriber = pusherExchange(operation);
        const next = (data) => { log.push(["next", data]); };
        const error = (err) => { log.push(["error", err]); };
        const complete = (data) => { log.push(["complete", data]); };
        const subscription = subscriber.subscribe({ next, error, complete });
        return new Promise((resolve, _reject) => {
            (0, process_1.nextTick)(() => {
                pusher.trigger(channelName, { result: {}, more: true });
                expect(Object.keys(pusher._channels)).toEqual([channelName]);
                subscription.unsubscribe();
                expect(Object.keys(pusher._channels)).toEqual([]);
                const expectedLog = [
                    ["subscribe", "1234"],
                    ["next", { data: { foo: "bar" } }],
                    ["unsubscribe", "1234"]
                ];
                expect(log).toEqual(expectedLog);
                resolve(true);
            });
        });
    });
});
describe("SubscriptionExchange with ActionCable", () => {
    it("calls through to handlers", () => {
        var handlers;
        var log = [];
        var dummyActionCableConsumer = {
            subscriptions: {
                create: (channelName, newHandlers) => {
                    log.push(["create", channelName]);
                    handlers = newHandlers;
                    return {
                        perform: (evt, data) => {
                            log.push([evt, data]);
                        },
                        unsubscribe: () => {
                            log.push(["unsubscribed", null]);
                        }
                    };
                }
            }
        };
        var options = {
            consumer: dummyActionCableConsumer,
            channelName: "CustomChannel"
        };
        var exchange = SubscriptionExchange_1.default.create(options);
        var parsedQuery = (0, graphql_1.parse)("{ foo { bar } }");
        var operation = {
            query: parsedQuery,
            variables: {},
            context: {
                url: "/graphql",
                requestPolicy: "network-only",
            },
            kind: "subscription",
        };
        var subscriber = exchange(operation);
        const next = (data) => { log.push(["next", data]); };
        const error = (err) => { log.push(["error", err]); };
        const complete = (data) => { log.push(["complete", data]); };
        const subscription = subscriber.subscribe({ next, error, complete });
        return new Promise((resolve, _reject) => {
            (0, process_1.nextTick)(() => {
                handlers.connected(); // trigger the GraphQL send
                handlers.received({ result: { data: { a: "1" } }, more: false });
                subscription.unsubscribe();
                const expectedLog = [
                    ["create", "CustomChannel"],
                    ["execute", { query: parsedQuery, variables: {} }],
                    ["next", { data: { a: "1" } }],
                    ["complete", undefined],
                    ["unsubscribed", null],
                ];
                expect(log).toEqual(expectedLog);
                resolve(true);
            });
        });
    });
});
