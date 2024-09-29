import { ApolloLink, Observable, FetchResult, NextLink, Operation } from "@apollo/client/core";
import { Realtime } from "ably";
type RequestResult = Observable<FetchResult<{
    [key: string]: any;
}, Record<string, any>, Record<string, any>>>;
declare class AblyLink extends ApolloLink {
    ably: Realtime;
    constructor(options: {
        ably: Realtime;
    });
    request(operation: Operation, forward: NextLink): RequestResult;
    _getSubscriptionChannel(operation: Operation): {
        channel: any;
        key: any;
    };
    _createSubscription(subscriptionChannelConfig: {
        channel: string;
        key: string;
    }, observer: {
        next: Function;
        complete: Function;
    }): void;
}
export default AblyLink;
