import { ApolloLink, Observable, FetchResult, Operation, NextLink } from "@apollo/client/core";
import type { Consumer } from "@rails/actioncable";
type RequestResult = FetchResult<{
    [key: string]: any;
}, Record<string, any>, Record<string, any>>;
type ConnectionParams = object | ((operation: Operation) => object);
declare class ActionCableLink extends ApolloLink {
    cable: Consumer;
    channelName: string;
    actionName: string;
    connectionParams: ConnectionParams;
    constructor(options: {
        cable: Consumer;
        channelName?: string;
        actionName?: string;
        connectionParams?: ConnectionParams;
    });
    request(operation: Operation, _next: NextLink): Observable<RequestResult>;
}
export default ActionCableLink;
