"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ActionCableLink_1 = __importDefault(require("../ActionCableLink"));
const graphql_1 = require("graphql");
describe("ActionCableLink", () => {
    var log;
    var cable;
    var options;
    var query;
    var operation;
    beforeEach(() => {
        log = [];
        cable = {
            subscriptions: {
                create: function (channelName, options) {
                    var channel = channelName;
                    var params = typeof channel === "object" ? channel : { channel };
                    var alreadyConnected = false;
                    var subscription = Object.assign(Object.create({
                        perform: function (actionName, options) {
                            log.push(["perform", { actionName: actionName, options: options }]);
                        },
                        unsubscribe: function () {
                            log.push(["unsubscribe"]);
                        }
                    }), { params }, options);
                    subscription.connected = subscription.connected.bind(subscription);
                    var received = subscription.received;
                    subscription.received = function (data) {
                        if (!alreadyConnected) {
                            alreadyConnected = true;
                            subscription.connected();
                        }
                        received(data);
                    };
                    subscription.__proto__.unsubscribe = subscription.__proto__.unsubscribe.bind(subscription);
                    return subscription;
                }
            }
        };
        options = {
            cable: cable
        };
        query = (0, graphql_1.parse)("subscription { foo { bar } }");
        operation = {
            query: query,
            variables: { a: 1 },
            operationId: "operationId",
            operationName: "operationName"
        };
    });
    it("delegates to the cable", () => {
        var observable = new ActionCableLink_1.default(options).request(operation, null);
        // unpack the underlying subscription
        var subscription = observable.subscribe(function (result) {
            log.push(["received", result]);
        })._cleanup;
        subscription.received({
            result: {
                data: null
            },
            more: true
        });
        subscription.received({
            result: {
                data: "data 1"
            },
            more: true
        });
        subscription.received({
            result: {
                data: "data 2"
            },
            more: false
        });
        expect(log).toEqual([
            [
                "perform", {
                    actionName: "execute",
                    options: {
                        query: "subscription {\n  foo {\n    bar\n  }\n}",
                        variables: { a: 1 },
                        operationId: "operationId",
                        operationName: "operationName"
                    }
                }
            ],
            ["received", { data: "data 1" }],
            ["received", { data: "data 2" }],
            ["unsubscribe"]
        ]);
    });
    it("delegates a manual unsubscribe to the cable", () => {
        var observable = new ActionCableLink_1.default(options).request(operation, null);
        // unpack the underlying subscription
        var subscription = observable.subscribe(function (result) {
            log.push(["received", result]);
        })._cleanup;
        subscription.received({
            result: {
                data: null
            },
            more: true
        });
        subscription.received({
            result: {
                data: "data 1"
            },
            more: true
        });
        subscription.unsubscribe();
        expect(log).toEqual([
            [
                "perform", {
                    actionName: "execute",
                    options: {
                        query: "subscription {\n  foo {\n    bar\n  }\n}",
                        variables: { a: 1 },
                        operationId: "operationId",
                        operationName: "operationName"
                    }
                }
            ],
            ["received", { data: "data 1" }],
            ["unsubscribe"]
        ]);
    });
    it("forward object connectionParams to subscription creation", () => {
        var observable = new ActionCableLink_1.default(Object.assign(options, { connectionParams: { test: 1 } })).
            request(operation, null);
        // unpack the underlying subscription
        var subscription = observable.subscribe(() => null)._cleanup;
        subscription.unsubscribe();
        expect(subscription.params["test"]).toEqual(1);
    });
    it("calls connectionParams during subscription creation to fetch additional params", () => {
        var observable = new ActionCableLink_1.default(Object.assign(options, { connectionParams: () => ({ test: 1 }) })).request(operation, null);
        // unpack the underlying subscription
        var subscription = observable.subscribe(() => null)._cleanup;
        subscription.unsubscribe();
        expect(subscription.params["test"]).toEqual(1);
    });
});
