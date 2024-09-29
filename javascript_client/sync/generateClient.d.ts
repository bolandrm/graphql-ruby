declare var JS_TYPE: string;
declare var JSON_TYPE: string;
interface GenerateClientCodeOptions {
    path?: string;
    mode?: string;
    addTypename?: boolean;
    clientType?: string;
    client: string;
    hash?: Function;
    verbose?: boolean;
}
interface OperationStoreClient {
    getOperationId: (operationName: string) => string;
    getPersistedQueryAlias: (operationName: string) => string;
    apolloMiddleware: {
        applyMiddleware: (req: any, next: any) => any;
    };
    apolloLink: (operation: any, forward: any) => any;
}
/**
 * Generate a JavaScript client module based on local `.graphql` files.
 *
 * See {gatherOperations} and {generateClientCode} for options.
 * @return {String} The generated JavaScript code
*/
declare function generateClient(options: GenerateClientCodeOptions): string;
interface ClientOperation {
    alias: string;
    name?: string;
    body: string;
}
/**
 * Parse files in the specified path and generate an alias for each operation.
*/
declare function gatherOperations(options: GenerateClientCodeOptions): {
    operations: ClientOperation[];
};
/**
 * Given a map of { name => alias } pairs, generate outfile based on type.
 * @param {String} clientName - the client ID that this map belongs to
 * @param {Object} nameToAlias - `name => alias` pairs
 * @param {String} type - the outfile's type
 * @return {String} generated outfile code
*/
declare function generateClientCode(clientName: string, operations: ClientOperation[], type?: string): string;
export { generateClient, generateClientCode, gatherOperations, JS_TYPE, JSON_TYPE, ClientOperation, OperationStoreClient, };
