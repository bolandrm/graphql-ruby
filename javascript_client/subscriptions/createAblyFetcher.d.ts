import type Types from "ably";
type AblyFetcherOptions = {
    ably: Types.Realtime;
    url: String;
    fetch?: typeof fetch;
    fetchOptions?: any;
};
export default function createAblyFetcher(options: AblyFetcherOptions): (graphqlParams: any, _fetcherParams: any) => AsyncGenerator<any, void, unknown>;
export {};
