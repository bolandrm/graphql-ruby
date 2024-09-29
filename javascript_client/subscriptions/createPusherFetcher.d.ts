import type Pusher from "pusher-js";
type PusherFetcherOptions = {
    pusher: Pusher;
    url: String;
    fetch?: typeof fetch;
    fetchOptions: any;
};
export default function createPusherFetcher(options: PusherFetcherOptions): (graphqlParams: any, _fetcherParams: any) => AsyncGenerator<any, void, unknown>;
export {};
