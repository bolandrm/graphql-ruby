import { ApolloLink, Observable, Operation, NextLink, FetchResult } from "@apollo/client/core";
import Pusher from "pusher-js";
type RequestResult = FetchResult<{
    [key: string]: any;
}, Record<string, any>, Record<string, any>>;
declare class PusherLink extends ApolloLink {
    pusher: Pusher;
    decompress: (result: string) => any;
    constructor(options: {
        pusher: Pusher;
        decompress?: (result: string) => any;
    });
    request(operation: Operation, forward: NextLink): Observable<RequestResult>;
    _onUpdate(subscriptionChannel: string, observer: {
        next: Function;
        complete: Function;
    }, payload: {
        more: boolean;
        compressed_result?: string;
        result?: object;
    }): void;
}
export default PusherLink;
