"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const createRelaySubscriptionHandler_1 = __importDefault(require("../createRelaySubscriptionHandler"));
const createRelaySubscriptionHandler_2 = require("../createRelaySubscriptionHandler");
const relay_runtime_1 = require("relay-runtime");
describe("createRelaySubscriptionHandler", () => {
    it("returns a function producing a observable subscription", () => {
        var dummyActionCableConsumer = {
            subscriptions: {
                create: () => ({ unsubscribe: () => (true) })
            },
        };
        var options = {
            cable: dummyActionCableConsumer
        };
        var handler = (0, createRelaySubscriptionHandler_1.default)(options);
        var fetchQuery;
        // basically, make sure this doesn't blow up during type-checking or runtime
        expect(relay_runtime_1.Network.create(fetchQuery, handler)).toBeTruthy();
    });
    it("doesn't send an empty string when no string is given", () => {
        var channel;
        var performLog = [];
        var dummyActionCableConsumer = {
            subscriptions: {
                create: (opts1, opts2) => {
                    channel = Object.assign(opts1, opts2, {
                        unsubscribe: () => true,
                        perform: (event, payload) => performLog.push([event, payload]),
                    });
                    return channel;
                }
            },
        };
        var options = {
            cable: dummyActionCableConsumer
        };
        var handler = (0, createRelaySubscriptionHandler_1.default)(options);
        var observable = handler({ id: "abc", text: null, name: "def", operationKind: "subscription", metadata: {} }, { abc: true });
        observable.subscribe({});
        channel.connected();
        var expectedLog = [
            [
                'execute',
                {
                    variables: { abc: true },
                    operationName: 'def',
                    query: null,
                    operationId: null
                }
            ]
        ];
        expect(performLog).toEqual(expectedLog);
    });
});
describe("createLegacyRelaySubscriptionHandler", () => {
    it("still works", () => {
        var dummyActionCableConsumer = {
            subscriptions: {
                create: () => ({ unsubscribe: () => (true) })
            },
        };
        var options = {
            cable: dummyActionCableConsumer
        };
        expect((0, createRelaySubscriptionHandler_2.createLegacyRelaySubscriptionHandler)(options)).toBeInstanceOf(Function);
    });
});
