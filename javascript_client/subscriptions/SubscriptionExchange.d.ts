import Pusher from "pusher-js";
import Urql from "urql";
import { Consumer } from "@rails/actioncable";
type ForwardCallback = (...args: any[]) => void;
declare const SubscriptionExchange: {
    create(options: {
        pusher?: Pusher;
        consumer?: Consumer;
        channelName?: string;
    }): (operation: Urql.Operation) => {
        subscribe: ({ next, error, complete }: {
            next: ForwardCallback;
            error: ForwardCallback;
            complete: ForwardCallback;
        }) => {
            unsubscribe: () => void;
        };
    };
};
export default SubscriptionExchange;
