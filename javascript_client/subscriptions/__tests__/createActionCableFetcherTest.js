"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const createActionCableFetcher_1 = __importDefault(require("../createActionCableFetcher"));
const graphql_1 = require("graphql");
describe("createActionCableFetcherTest", () => {
    it("yields updates for subscriptions", () => {
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
        const fetchLog = [];
        const dummyFetch = function (url, fetchArgs) {
            fetchLog.push([url, fetchArgs.custom]);
            return Promise.resolve({ json: () => { { } } });
        };
        var options = {
            consumer: dummyActionCableConsumer,
            url: "/some_graphql_endpoint",
            fetch: dummyFetch,
            fetchOptions: {
                custom: true,
            }
        };
        var fetcher = (0, createActionCableFetcher_1.default)(options);
        const queryStr = "subscription listen { update { message } }";
        const doc = (0, graphql_1.parse)(queryStr);
        const res = fetcher({ operationName: "listen", query: queryStr, variables: {} }, { documentAST: doc });
        const promise = res.next().then((result) => {
            handlers.connected(); // trigger the GraphQL send
            expect(result).toEqual({ value: { data: "hello" }, done: false });
            expect(fetchLog).toEqual([]);
            expect(log).toEqual([
                ["execute", { operationName: "listen", query: queryStr, variables: {} }],
            ]);
        });
        handlers.received({ result: { data: "hello" } }); // simulate an update
        return promise.then(() => {
            let res2 = fetcher({ operationName: null, query: "{ __typename } ", variables: {} }, {});
            const promise2 = res2.next().then(() => {
                expect(fetchLog).toEqual([["/some_graphql_endpoint", true]]);
            });
            return promise2;
        });
    });
});
