import Logger from './logger';
interface SendPayloadOptions {
    url: string;
    logger: Logger;
    secret?: string;
    client?: string;
    headers?: {
        [key: string]: string;
    };
    changesetVersion?: string;
}
/**
 * Use HTTP POST to send this payload to the endpoint.
 *
 * Override this function with `options.send` to use custom auth.
 *
 * @private
 * @param {Object} payload - JS object to be posted as form data
 * @param {String} options.url - Target URL
 * @param {String} options.secret - (optional) used for HMAC header if provided
 * @param {String} options.client - (optional) used for HMAC header if provided
 * @param {Logger} options.logger - A logger for when `verbose` is true
 * @param {Object<String, String>} options.headers - (optional) extra headers for the request
 * @return {Promise}
*/
declare function sendPayload(payload: any, options: SendPayloadOptions): Promise<unknown>;
export default sendPayload;
