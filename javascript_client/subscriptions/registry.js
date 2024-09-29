"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// State management for subscriptions.
// Used to add subscriptions to an Apollo network interface.
class ApolloSubscriptionRegistry {
    constructor() {
        this._id = 1;
        this._subscriptions = {};
    }
    add(subscription) {
        var id = this._id++;
        this._subscriptions[id] = subscription;
        return id;
    }
    unsubscribe(id) {
        var subscription = this._subscriptions[id];
        if (!subscription) {
            throw new Error("No subscription found for id: " + id);
        }
        subscription.unsubscribe();
        delete this._subscriptions[id];
    }
}
exports.default = new ApolloSubscriptionRegistry;
