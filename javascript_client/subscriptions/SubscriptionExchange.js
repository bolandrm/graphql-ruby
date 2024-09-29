"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SubscriptionExchange = {
    create(options) {
        if (options.pusher) {
            return createPusherSubscription(options.pusher);
        }
        else if (options.consumer) {
            return createUrqlActionCableSubscription(options.consumer, options === null || options === void 0 ? void 0 : options.channelName);
        }
        else {
            throw new Error("Either `pusher: ...` or `consumer: ...` is required.");
        }
    }
};
function createPusherSubscription(pusher) {
    return function (operation) {
        // urql will call `.subscribed` on the returned object:
        // https://github.com/FormidableLabs/urql/blob/f89cfd06d9f14ae9cb3be10b21bd5cbd12ca275c/packages/core/src/exchanges/subscription.ts#L68-L73
        // https://github.com/FormidableLabs/urql/blob/f89cfd06d9f14ae9cb3be10b21bd5cbd12ca275c/packages/core/src/exchanges/subscription.ts#L82-L97
        return {
            subscribe: ({ next, error, complete }) => {
                // Somehow forward the operation to be POSTed to the server,
                // I don't see an option for passing this on to the `fetchExchange`
                const fetchBody = JSON.stringify({
                    query: operation.query,
                    variables: operation.variables,
                });
                var pusherChannelName;
                const subscriptionId = "" + operation.key;
                var fetchOptions = operation.context.fetchOptions;
                if (typeof fetchOptions === "function") {
                    fetchOptions = fetchOptions();
                }
                else if (fetchOptions == null) {
                    fetchOptions = {};
                }
                const headers = Object.assign(Object.assign({}, (fetchOptions.headers)), {
                    'Content-Type': 'application/json',
                    'X-Subscription-ID': subscriptionId
                });
                const defaultFetchOptions = { method: "POST" };
                const mergedFetchOptions = Object.assign(Object.assign(Object.assign({}, defaultFetchOptions), fetchOptions), { body: fetchBody, headers: headers });
                const fetchFn = operation.context.fetch || fetch;
                fetchFn(operation.context.url, mergedFetchOptions)
                    .then((fetchResult) => {
                    // Get the server-provided subscription ID
                    pusherChannelName = fetchResult.headers.get("X-Subscription-ID");
                    // Set up a subscription to Pusher, forwarding updates to
                    // the `next` function provided by urql
                    const pusherChannel = pusher.subscribe(pusherChannelName);
                    pusherChannel.bind("update", (payload) => {
                        // Here's an update to this subscription,
                        // pass it on:
                        if (payload.result) {
                            next(payload.result);
                        }
                        // If the server signals that this is the end,
                        // then unsubscribe the client:
                        if (!payload.more) {
                            complete();
                        }
                    });
                    // Continue processing the initial result for the subscription
                    return fetchResult.json();
                })
                    .then((jsonResult) => {
                    // forward the initial result to urql
                    next(jsonResult);
                })
                    .catch(error);
                // urql will call `.unsubscribe()` if it's returned here:
                // https://github.com/FormidableLabs/urql/blob/f89cfd06d9f14ae9cb3be10b21bd5cbd12ca275c/packages/core/src/exchanges/subscription.ts#L102
                return {
                    unsubscribe: () => {
                        // When requested by urql, disconnect from this channel
                        pusherChannelName && pusher.unsubscribe(pusherChannelName);
                    }
                };
            }
        };
    };
}
function createUrqlActionCableSubscription(consumer, channelName = "GraphqlChannel") {
    return function (operation) {
        let subscription = null;
        // urql will call `.subscribed` on the returned object:
        // https://github.com/FormidableLabs/urql/blob/f89cfd06d9f14ae9cb3be10b21bd5cbd12ca275c/packages/core/src/exchanges/subscription.ts#L68-L73
        // https://github.com/FormidableLabs/urql/blob/f89cfd06d9f14ae9cb3be10b21bd5cbd12ca275c/packages/core/src/exchanges/subscription.ts#L82-L97
        return {
            subscribe: ({ next, error, complete }) => {
                subscription = consumer.subscriptions.create(channelName, {
                    connected() {
                        console.log(subscription);
                        subscription === null || subscription === void 0 ? void 0 : subscription.perform("execute", { query: operation.query, variables: operation.variables });
                    },
                    received(data) {
                        var _a, _b;
                        if ((_a = data === null || data === void 0 ? void 0 : data.result) === null || _a === void 0 ? void 0 : _a.errors) {
                            error(data.errors);
                        }
                        if ((_b = data === null || data === void 0 ? void 0 : data.result) === null || _b === void 0 ? void 0 : _b.data) {
                            next(data.result);
                        }
                        if (!data.more) {
                            complete();
                        }
                    }
                });
                // urql will call `.unsubscribe()` if it's returned here:
                // https://github.com/FormidableLabs/urql/blob/f89cfd06d9f14ae9cb3be10b21bd5cbd12ca275c/packages/core/src/exchanges/subscription.ts#L102
                return {
                    unsubscribe: () => {
                        subscription === null || subscription === void 0 ? void 0 : subscription.unsubscribe();
                    }
                };
            }
        };
    };
}
exports.default = SubscriptionExchange;
