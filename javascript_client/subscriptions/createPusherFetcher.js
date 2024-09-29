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
function createPusherFetcher(options) {
    var currentChannel = null;
    return function (graphqlParams, _fetcherParams) {
        return __asyncGenerator(this, arguments, function* () {
            var _a, e_1, _b, _c;
            var nextPromiseResolve = null;
            var shouldBreak = false;
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
            const fetchFn = options.fetch || window.fetch;
            fetchFn("/graphql", Object.assign({ method: "POST", body: JSON.stringify(graphqlParams), headers: {
                    'content-type': 'application/json',
                } }, options.fetchOptions)).then((r) => {
                const subId = r.headers.get("X-Subscription-ID");
                if (subId) {
                    currentChannel && currentChannel.unsubscribe();
                    currentChannel = options.pusher.subscribe(subId);
                    currentChannel.bind("update", (payload) => {
                        if (nextPromiseResolve) {
                            nextPromiseResolve({ value: payload.result, done: false });
                        }
                    });
                    if (nextPromiseResolve) {
                        nextPromiseResolve({ value: r.json(), done: false });
                    }
                }
                else {
                    shouldBreak = true;
                    if (nextPromiseResolve) {
                        nextPromiseResolve({ value: r.json(), done: false });
                    }
                }
            });
            try {
                for (var _d = true, iterator_1 = __asyncValues(iterator), iterator_1_1; iterator_1_1 = yield __await(iterator_1.next()), _a = iterator_1_1.done, !_a; _d = true) {
                    _c = iterator_1_1.value;
                    _d = false;
                    const payload = _c;
                    yield yield __await(payload);
                    if (shouldBreak) {
                        break;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = iterator_1.return)) yield __await(_b.call(iterator_1));
                }
                finally { if (e_1) throw e_1.error; }
            }
        });
    };
}
exports.default = createPusherFetcher;
