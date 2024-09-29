"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const printer_1 = __importDefault(require("graphql/language/printer"));
const registry_1 = __importDefault(require("./registry"));
class ActionCableSubscriber {
    constructor(cable, networkInterface, channelName) {
        this._cable = cable;
        this._networkInterface = networkInterface;
        this._channelName = channelName || "GraphqlChannel";
    }
    /**
     * Send `request` over ActionCable (`registry._cable`),
     * calling `handler` with any incoming data.
     * Return the subscription so that the registry can unsubscribe it later.
     * @param {Object} registry
     * @param {Object} request
     * @param {Function} handler
     * @return {ID} An ID for unsubscribing
    */
    subscribe(request, handler) {
        var networkInterface = this._networkInterface;
        // unique-ish
        var channelId = Math.round(Date.now() + Math.random() * 100000).toString(16);
        var channel = this._cable.subscriptions.create({
            channel: this._channelName,
            channelId: channelId,
        }, {
            // After connecting, send the data over ActionCable
            connected: function () {
                // applyMiddlewares code is inspired by networkInterface internals
                var opts = Object.assign({}, networkInterface._opts);
                networkInterface
                    .applyMiddlewares({ request: request, options: opts })
                    .then(function () {
                    var queryString = request.query ? printer_1.default.print(request.query) : null;
                    var operationName = request.operationName;
                    var operationId = request.operationId;
                    var variables = JSON.stringify(request.variables);
                    var channelParams = Object.assign({}, request, {
                        query: queryString,
                        variables: variables,
                        operationId: operationId,
                        operationName: operationName,
                    });
                    channel.perform("execute", channelParams);
                });
            },
            // Payload from ActionCable should have at least two keys:
            // - more: true if this channel should stay open
            // - result: the GraphQL response for this result
            received: function (payload) {
                var result = payload.result;
                if (result) {
                    handler(result.errors, result.data);
                }
                if (!payload.more) {
                    registry_1.default.unsubscribe(id);
                }
            },
        });
        var id = registry_1.default.add(channel);
        return id;
    }
    unsubscribe(id) {
        registry_1.default.unsubscribe(id);
    }
}
exports.default = ActionCableSubscriber;
