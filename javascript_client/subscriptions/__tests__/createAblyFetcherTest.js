"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const createAblyFetcher_1 = __importDefault(require("../createAblyFetcher"));
function createAbly() {
    const _channels = {};
    const ably = {
        _channels: _channels,
        channels: {
            get(channelName) {
                return _channels[channelName] || (_channels[channelName] = {
                    _listeners: [],
                    name: channelName,
                    presence: {
                        enterClient(_clientName, _status) { },
                        leaveClient(_clientName) { },
                    },
                    detach(callback) {
                        callback();
                    },
                    subscribe(eventName, callback) {
                        this._listeners.push([eventName, callback]);
                    },
                    unsubscribe() { }
                });
            },
            release(channelName) {
                delete _channels[channelName];
            }
        },
        __testTrigger(channelName, eventName, data) {
            const channel = this.channels.get(channelName);
            const handler = channel._listeners.find((l) => l[0] == eventName);
            if (handler) {
                handler[1](data);
            }
        }
    };
    return ably;
}
describe("createAblyFetcher", () => {
    it("yields updates for subscriptions", () => {
        const ably = createAbly();
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
        const fetcher = (0, createAblyFetcher_1.default)({
            ably: ably,
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
            ably.__testTrigger("abcd", "update", { data: { result: { data: { hi: "Bonjour" } } } });
            return promise.then(() => {
                // Test non-subscriptions too:
                expect(Object.keys(ably._channels)).toEqual(["abcd"]);
                const queryResult = fetcher({ variables: {}, operationName: null, body: "{ __typename }" }, {});
                return queryResult.next().then((res) => {
                    expect(res.value.data).toEqual({ hi: "First response" });
                    return queryResult.next().then((res2) => {
                        expect(res2.done).toEqual(true);
                        expect(ably._channels).toEqual({});
                    });
                });
            });
        });
    });
});
