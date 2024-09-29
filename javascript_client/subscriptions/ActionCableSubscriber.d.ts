import type { Consumer } from "@rails/actioncable";
interface ApolloNetworkInterface {
    applyMiddlewares: Function;
    query: (req: object) => Promise<any>;
    _opts: any;
}
declare class ActionCableSubscriber {
    _cable: Consumer;
    _networkInterface: ApolloNetworkInterface;
    _channelName: string;
    constructor(cable: Consumer, networkInterface: ApolloNetworkInterface, channelName?: string);
    /**
     * Send `request` over ActionCable (`registry._cable`),
     * calling `handler` with any incoming data.
     * Return the subscription so that the registry can unsubscribe it later.
     * @param {Object} registry
     * @param {Object} request
     * @param {Function} handler
     * @return {ID} An ID for unsubscribing
    */
    subscribe(request: any, handler: any): number;
    unsubscribe(id: number): void;
}
export default ActionCableSubscriber;
