"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@apollo/client/core");
const graphql_1 = require("graphql");
class ActionCableLink extends core_1.ApolloLink {
    constructor(options) {
        super();
        this.cable = options.cable;
        this.channelName = options.channelName || "GraphqlChannel";
        this.actionName = options.actionName || "execute";
        this.connectionParams = options.connectionParams || {};
    }
    // Interestingly, this link does _not_ call through to `next` because
    // instead, it sends the request to ActionCable.
    request(operation, _next) {
        return new core_1.Observable((observer) => {
            var channelId = Math.round(Date.now() + Math.random() * 100000).toString(16);
            var actionName = this.actionName;
            var connectionParams = (typeof this.connectionParams === "function") ?
                this.connectionParams(operation) : this.connectionParams;
            var channel = this.cable.subscriptions.create(Object.assign({}, {
                channel: this.channelName,
                channelId: channelId
            }, connectionParams), {
                connected: function () {
                    this.perform(actionName, {
                        query: operation.query ? (0, graphql_1.print)(operation.query) : null,
                        variables: operation.variables,
                        // This is added for persisted operation support:
                        operationId: operation.operationId,
                        operationName: operation.operationName
                    });
                },
                received: function (payload) {
                    var _a, _b;
                    if (((_a = payload === null || payload === void 0 ? void 0 : payload.result) === null || _a === void 0 ? void 0 : _a.data) || ((_b = payload === null || payload === void 0 ? void 0 : payload.result) === null || _b === void 0 ? void 0 : _b.errors)) {
                        observer.next(payload.result);
                    }
                    if (!payload.more) {
                        observer.complete();
                    }
                }
            });
            // Make the ActionCable subscription behave like an Apollo subscription
            return Object.assign(channel, { closed: false });
        });
    }
}
exports.default = ActionCableLink;
