import Pusher from "pusher-js";
interface PusherHandlerOptions {
    pusher: Pusher;
    fetchOperation: Function;
    decompress?: Function;
}
declare function createPusherHandler(options: PusherHandlerOptions): (operation: object, variables: object, cacheConfig: object, observer: {
    onNext: Function;
    onError: Function;
    onCompleted: Function;
}) => {
    dispose: () => void;
};
export { createPusherHandler, PusherHandlerOptions };
