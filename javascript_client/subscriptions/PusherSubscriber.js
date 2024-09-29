"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const registry_1 = __importDefault(require("./registry"));
/**
 * Make a new subscriber for `addGraphQLSubscriptions`
 *
 * @param {Pusher} pusher
*/
class PusherSubscriber {
    constructor(pusher, networkInterface, decompress) {
        this._pusher = pusher;
        this._networkInterface = networkInterface;
        this._decompress = decompress || function (_compressed) { throw new Error("Received compressed_result but this addGraphQLSubscriptions wasn't configured with `decompress: (result: string) => any`. Add this configuration."); };
        // This is a bit tricky:
        // only the _request_ is passed to the `subscribe` function, s
        // so we have to attach the subscription id to the `request`.
        // However, the request is _not_ available in the afterware function.
        // So:
        // - Add the request to `options` so it's available in afterware
        // - In the afterware, update the request to hold the header value
        // - Finally, in `subscribe`, read the subscription ID off of `request`
        networkInterface.use([{
                applyMiddleware: function ({ request, options }, next) {
                    options.request = request;
                    next();
                }
            }]);
        networkInterface.useAfter([{
                applyAfterware: function ({ response, options }, next) {
                    options.request.__subscriptionId = response.headers.get("X-Subscription-ID");
                    next();
                }
            }]);
    }
    // Implement the Apollo subscribe API
    subscribe(request, handler) {
        var pusher = this._pusher;
        var networkInterface = this._networkInterface;
        var decompress = this._decompress;
        var subscription = {
            _channelName: "", // set after the successful POST
            unsubscribe: function () {
                if (this._channelName) {
                    pusher.unsubscribe(this._channelName);
                }
            }
        };
        var id = registry_1.default.add(subscription);
        // Send the subscription as a query
        // Get the channel ID from the response headers
        networkInterface.query(request).then(function (_executionResult) {
            var subscriptionChannel = request.__subscriptionId;
            subscription._channelName = subscriptionChannel;
            var pusherChannel = pusher.subscribe(subscriptionChannel);
            // When you get an update form Pusher, send it to Apollo
            pusherChannel.bind("update", function (payload) {
                var result = payload.compressed_result ? decompress(payload.compressed_result) : payload.result;
                if (result) {
                    handler(result.errors, result.data);
                }
                if (!payload.more) {
                    registry_1.default.unsubscribe(id);
                }
            });
        });
        return id;
    }
    unsubscribe(id) {
        registry_1.default.unsubscribe(id);
    }
}
exports.default = PusherSubscriber;
