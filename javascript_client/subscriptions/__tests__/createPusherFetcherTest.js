"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const createPusherFetcher_1 = __importDefault(require("../createPusherFetcher"));
describe("createPusherFetcher", () => {
    it("yields updates for subscriptions", () => {
        const pusher = {
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
                var handlers = this._channels[channel];
                if (!handlers) {
                    handlers = this._channels[channel] = [];
                }
                return {
                    bind: (action, handler) => {
                        handlers.push([action, handler]);
                    },
                    unsubscribe: () => {
                        delete this._channels[channel];
                    }
                };
            },
            unsubscribe: (_channel) => {
            },
        };
        const fetchLog = [];
        const dummyFetch = function (url, fetchArgs) {
            fetchLog.push([url, fetchArgs.customOpt]);
            const dummyResponse = {
                json: () => {
                    return {
                        data: {
                            hi: "First response"
                        }
                    };
                },
                headers: {
                    get() {
                        return fetchArgs.body.includes("subscription") ? "abcd" : null;
                    }
                }
            };
            return Promise.resolve(dummyResponse);
        };
        const fetcher = (0, createPusherFetcher_1.default)({
            pusher: pusher,
            url: "/graphql",
            fetch: dummyFetch,
            fetchOptions: { customOpt: true }
        });
        const result = fetcher({
            variables: {},
            operationName: "hello",
            body: "subscription hello { hi }"
        }, {});
        return result.next().then((res) => {
            expect(res.value.data.hi).toEqual("First response");
            expect(fetchLog).toEqual([["/graphql", true]]);
        }).then(() => {
            const promise = result.next().then((res2) => {
                expect(res2).toEqual({ value: { data: { hi: "Bonjour" } }, done: false });
            });
            pusher.trigger("abcd", "update", { result: { data: { hi: "Bonjour" } } });
            return promise.then(() => {
                // Test non-subscriptions too:
                expect(Object.keys(pusher._channels)).toEqual(["abcd"]);
                const queryResult = fetcher({ variables: {}, operationName: null, body: "{ __typename }" }, {});
                return queryResult.next().then((res) => {
                    expect(res.value.data).toEqual({ hi: "First response" });
                    return queryResult.next().then((res2) => {
                        expect(res2.done).toEqual(true);
                        expect(pusher._channels).toEqual({});
                    });
                });
            });
        });
    });
});
