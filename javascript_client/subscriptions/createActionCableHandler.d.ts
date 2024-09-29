import type { Consumer } from "@rails/actioncable";
/**
 * Create a Relay Modern-compatible subscription handler.
 *
 * @param {ActionCable.Consumer} cable - An ActionCable consumer from `.createConsumer`
 * @param {OperationStoreClient} operations - A generated OperationStoreClient for graphql-pro's OperationStore
 * @return {Function}
*/
interface ActionCableHandlerOptions {
    cable: Consumer;
    operations?: {
        getOperationId: Function;
    };
    channelName?: string;
    clientName?: string;
}
declare function createActionCableHandler(options: ActionCableHandlerOptions): (operation: {
    text: string;
    name: string;
    id?: string;
}, variables: object, _cacheConfig: object, observer: {
    onError: Function;
    onNext: Function;
    onCompleted: Function;
}) => {
    dispose: () => void;
};
export { createActionCableHandler, ActionCableHandlerOptions };
