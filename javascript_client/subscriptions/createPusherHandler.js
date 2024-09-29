"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPusherHandler = void 0;
function createPusherHandler(options) {
    var pusher = options.pusher;
    var fetchOperation = options.fetchOperation;
    var decompress = options.decompress || function (_compressed) {
        throw new Error("Received compressed_result but createPusherHandler wasn't configured with `decompress: (result: string) => any`. Add this configuration.");
    };
    return function (operation, variables, cacheConfig, observer) {
        var channelName;
        // POST the subscription like a normal query
        fetchOperation(operation, variables, cacheConfig).then(function (response) {
            channelName = response.headers.get("X-Subscription-ID");
            var channel = pusher.subscribe(channelName);
            // When you get an update from pusher, give it to Relay
            channel.bind("update", function (payload) {
                // TODO Extract this code
                // When we get a response, send the update to `observer`
                let result = null;
                if (payload.compressed_result) {
                    result = decompress(payload.compressed_result);
                }
                else {
                    result = payload.result;
                }
                if (result && result.errors) {
                    // What kind of error stuff belongs here?
                    observer.onError(result.errors);
                }
                else if (result) {
                    observer.onNext({ data: result.data });
                }
                if (!payload.more) {
                    // Subscription is finished
                    observer.onCompleted();
                }
            });
        });
        return {
            dispose: function () {
                pusher.unsubscribe(channelName);
            }
        };
    };
}
exports.createPusherHandler = createPusherHandler;
