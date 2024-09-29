import { ActionCableHandlerOptions } from "./createActionCableHandler";
import { PusherHandlerOptions } from "./createPusherHandler";
import { AblyHandlerOptions } from "./createAblyHandler";
import { RequestParameters, Variables } from "relay-runtime";
declare function createLegacyRelaySubscriptionHandler(options: ActionCableHandlerOptions | PusherHandlerOptions | AblyHandlerOptions): any;
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
declare function createRelaySubscriptionHandler(options: ActionCableHandlerOptions | PusherHandlerOptions | AblyHandlerOptions): (request: RequestParameters, variables: Variables) => any;
export { createLegacyRelaySubscriptionHandler };
export default createRelaySubscriptionHandler;
