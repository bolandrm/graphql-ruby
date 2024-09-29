import type { Consumer } from "@rails/actioncable";
type ActionCableFetcherOptions = {
    consumer: Consumer;
    url: string;
    channelName?: string;
    fetch?: typeof fetch;
    fetchOptions?: any;
};
export default function createActionCableFetcher(options: ActionCableFetcherOptions): (graphqlParams: any, fetcherOpts: any) => AsyncGenerator<any, void, unknown>;
export {};
