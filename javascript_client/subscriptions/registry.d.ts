interface ApolloSubscription {
    unsubscribe: Function;
}
declare class ApolloSubscriptionRegistry {
    _id: number;
    _subscriptions: {
        [key: number]: ApolloSubscription;
    };
    constructor();
    add(subscription: ApolloSubscription): number;
    unsubscribe(id: number): void;
}
declare const _default: ApolloSubscriptionRegistry;
export default _default;
