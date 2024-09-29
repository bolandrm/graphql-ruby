import { Realtime, Types } from "ably";
interface AblyHandlerOptions {
    ably: Realtime;
    fetchOperation: Function;
}
interface GraphQLError {
    message: string;
    path: (string | number)[];
    locations: number[][];
    extensions?: object;
}
type OnErrorData = AblyError | Error | GraphQLError[];
interface ApolloObserver {
    onError: (err: OnErrorData) => void;
    onNext: Function;
    onCompleted: Function;
}
declare class AblyError extends Error {
    reason: Types.ErrorInfo;
    constructor(reason: Types.ErrorInfo);
    get code(): number;
    get statusCode(): number;
}
declare function createAblyHandler(options: AblyHandlerOptions): (operation: object, variables: object, cacheConfig: object, observer: ApolloObserver) => {
    dispose: () => Promise<void>;
};
export { createAblyHandler, AblyHandlerOptions, OnErrorData };
