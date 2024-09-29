/**
 * Read relay-compiler output
 * and extract info for persisting them & writing a map:
 *
 * - alias: get the relayHash from the header
 * - name: get the name from the JavaScript object
 * - body: get the text from the JavaScript object
 *
 * @param {Array} filenames -  Filenames to read
 * @return {Array} List of operations to persist & write to a map
 */
declare function prepareRelay(filenames: string[]): {
    alias: string;
    name: string;
    body: string;
}[];
export default prepareRelay;
