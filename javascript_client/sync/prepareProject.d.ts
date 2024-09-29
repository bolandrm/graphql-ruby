/**
 * Take a whole bunch of GraphQL in one big string
 * and validate it, especially:
 *
 * - operation names are unique
 * - fragment names are unique
 *
 * Then, split each operation into a free-standing document,
 * so it has all the fragments it needs.
 */
declare function prepareProject(filenames: string[], addTypename: boolean): {
    name: string;
    body: string;
    alias: string;
}[];
export default prepareProject;
