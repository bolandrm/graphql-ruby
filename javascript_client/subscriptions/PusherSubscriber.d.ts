import Pusher from "pusher-js";
interface ApolloNetworkInterface {
    use: Function;
    useAfter: Function;
    query: (req: object) => Promise<any>;
}
/**
 * Make a new subscriber for `addGraphQLSubscriptions`
 *
 * @param {Pusher} pusher
*/
declare class PusherSubscriber {
    _pusher: Pusher;
    _networkInterface: ApolloNetworkInterface;
    _decompress: (compressed: string) => any;
    constructor(pusher: Pusher, networkInterface: ApolloNetworkInterface, decompress?: (compressed: string) => any);
    subscribe(request: {
        __subscriptionId: string;
    }, handler: any): number;
    unsubscribe(id: number): void;
}
export default PusherSubscriber;
