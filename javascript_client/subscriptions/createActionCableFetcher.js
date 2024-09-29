"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
function createActionCableFetcher(options) {
    let currentChannel = null;
    const consumer = options.consumer;
    const url = options.url || "/graphql";
    const channelName = options.channelName || "GraphqlChannel";
    const subscriptionFetcher = function (graphqlParams, fetcherOpts) {
        return __asyncGenerator(this, arguments, function* () {
            var _a, e_1, _b, _c;
            let isSubscription = false;
            let nextPromiseResolve = null;
            fetcherOpts.documentAST && (0, graphql_1.visit)(fetcherOpts.documentAST, {
                OperationDefinition(node) {
                    var _a;
                    if (graphqlParams.operationName === ((_a = node.name) === null || _a === void 0 ? void 0 : _a.value) && node.operation === 'subscription') {
                        isSubscription = true;
                    }
                },
            });
            if (isSubscription) {
                currentChannel === null || currentChannel === void 0 ? void 0 : currentChannel.unsubscribe();
                currentChannel = consumer.subscriptions.create(channelName, {
                    connected: function () {
                        currentChannel === null || currentChannel === void 0 ? void 0 : currentChannel.perform("execute", {
                            query: graphqlParams.query,
                            operationName: graphqlParams.operationName,
                            variables: graphqlParams.variables,
                        });
                    },
                    received: function (data) {
                        if (nextPromiseResolve) {
                            nextPromiseResolve({ value: data.result, done: false });
                        }
                    }
                });
                var iterator = {
                    [Symbol.asyncIterator]() {
                        return {
                            next() {
                                return new Promise((resolve, _reject) => {
                                    nextPromiseResolve = resolve;
                                });
                            },
                            return() {
                                if (currentChannel) {
                                    currentChannel.unsubscribe();
                                    currentChannel = null;
                                }
                                return Promise.resolve({ value: null, done: true });
                            }
                        };
                    }
                };
                try {
                    for (var _d = true, iterator_1 = __asyncValues(iterator), iterator_1_1; iterator_1_1 = yield __await(iterator_1.next()), _a = iterator_1_1.done, !_a; _d = true) {
                        _c = iterator_1_1.value;
                        _d = false;
                        const payload = _c;
                        yield yield __await(payload);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (!_d && !_a && (_b = iterator_1.return)) yield __await(_b.call(iterator_1));
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            else {
                const fetchFn = options.fetch || window.fetch;
                // Not a subscription fetcher, post to the given URL
                yield yield __await(fetchFn(url, Object.assign({ method: "POST", body: JSON.stringify({
                        query: graphqlParams.query,
                        operationName: graphqlParams.operationName,
                        variables: graphqlParams.variables,
                    }), headers: {
                        'content-type': 'application/json',
                    } }, options.fetchOptions)).then((r) => r.json()));
                return yield __await(void 0);
            }
        });
    };
    return subscriptionFetcher;
}
exports.default = createActionCableFetcher;
