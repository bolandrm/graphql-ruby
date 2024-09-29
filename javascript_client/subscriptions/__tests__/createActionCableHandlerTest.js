"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createActionCableHandler_1 = require("../createActionCableHandler");
describe("createActionCableHandler", () => {
    it("returns a function producing a disposable subscription", () => {
        var wasDisposed = false;
        var subscription = {
            unsubscribe: () => (wasDisposed = true)
        };
        var dummyActionCableConsumer = {
            subscriptions: {
                create: () => subscription
            },
        };
        var options = {
            cable: dummyActionCableConsumer
        };
        var producer = (0, createActionCableHandler_1.createActionCableHandler)(options);
        producer({ text: "", name: "" }, {}, {}, { onError: () => { }, onNext: () => { }, onCompleted: () => { } }).dispose();
        expect(wasDisposed).toEqual(true);
    });
    it("uses a provided clientName and operation.id", () => {
        var handlers;
        var log = [];
        var dummyActionCableConsumer = {
            subscriptions: {
                create: (_conn, newHandlers) => {
                    handlers = newHandlers;
                    return {
                        perform: (evt, data) => {
                            log.push([evt, data]);
                        }
                    };
                }
            }
        };
        var options = {
            cable: dummyActionCableConsumer,
            clientName: "client-1",
        };
        var producer = (0, createActionCableHandler_1.createActionCableHandler)(options);
        producer({ text: "", name: "", id: "abcdef" }, {}, {}, { onError: () => { }, onNext: (result) => { log.push(["onNext", result]); }, onCompleted: () => { log.push(["onCompleted", null]); } });
        handlers.connected(); // trigger the GraphQL send
        handlers.received({ result: { data: { a: "1" } }, more: false });
        expect(log).toEqual([
            ["execute", { operationId: "client-1/abcdef", operationName: "", query: "", variables: {} }],
            ["onNext", { data: { a: "1" } }],
            ["onCompleted", null],
        ]);
    });
});
