/**
 * Read a bunch of GraphQL files and treat them as islands.
 * Don't join any fragments from other files.
 * Don't make assertions about name uniqueness.
 *
 */
declare function prepareIsolatedFiles(filenames: string[], addTypename: boolean): {
    alias: string;
    name: string;
    body: string;
}[];
export default prepareIsolatedFiles;
