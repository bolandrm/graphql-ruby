"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLegacyRelaySubscriptionHandler = void 0;
const createActionCableHandler_1 = require("./createActionCableHandler");
const createPusherHandler_1 = require("./createPusherHandler");
const createAblyHandler_1 = require("./createAblyHandler");
const relay_runtime_1 = require("relay-runtime");
function createLegacyRelaySubscriptionHandler(options) {
    var handler;
    if (options.cable) {
        handler = (0, createActionCableHandler_1.createActionCableHandler)(options);
    }
    else if (options.pusher) {
        handler = (0, createPusherHandler_1.createPusherHandler)(options);
    }
    else if (options.ably) {
        handler = (0, createAblyHandler_1.createAblyHandler)(options);
    }
    else {
        throw new Error("Missing options for subscription handler");
    }
    return handler;
}
exports.createLegacyRelaySubscriptionHandler = createLegacyRelaySubscriptionHandler;
/**
 * Transport-agnostic wrapper for Relay Modern subscription handlers.
 * @example Add ActionCable subscriptions
 *   var subscriptionHandler = createHandler({
 *     cable: cable,
 *     operations: OperationStoreClient,
 *   })
 *   var network = Network.create(fetchQuery, subscriptionHandler)
 * @param {ActionCable.Consumer} options.cable - A consumer from `.createConsumer`
 * @param {Pusher} options.pusher - A Pusher client
 * @param {Ably.Realtime} options.ably - An Ably client
 * @param {OperationStoreClient} options.operations - A generated `OperationStoreClient` for graphql-pro's OperationStore
 * @return {Function} A handler for a Relay Modern network
*/
function createRelaySubscriptionHandler(options) {
    const handler = createLegacyRelaySubscriptionHandler(options);
    // Turn the handler into a relay-ready subscribe function
    return (request, variables) => {
        return relay_runtime_1.Observable.from({
            subscribe: (observer) => {
                const client = handler({
                    text: request.text,
                    name: request.name,
                    id: request.id,
                }, variables, {}, {
                    onError: (_error) => {
                        observer.error;
                    },
                    onNext: (res) => {
                        if (!res || !res.data) {
                            return;
                        }
                        observer.next(res);
                    },
                    onCompleted: observer.complete,
                });
                return {
                    unsubscribe: () => {
                        client.dispose();
                    },
                };
            },
        });
    };
}
exports.default = createRelaySubscriptionHandler;
