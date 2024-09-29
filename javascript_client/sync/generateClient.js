"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSON_TYPE = exports.JS_TYPE = exports.gatherOperations = exports.generateClientCode = exports.generateClient = void 0;
const glob_1 = require("glob");
const prepareRelay_1 = __importDefault(require("./prepareRelay"));
const prepareIsolatedFiles_1 = __importDefault(require("./prepareIsolatedFiles"));
const prepareProject_1 = __importDefault(require("./prepareProject"));
const md5_1 = __importDefault(require("./md5"));
const js_1 = __importDefault(require("./outfileGenerators/js"));
const json_1 = __importDefault(require("./outfileGenerators/json"));
var JS_TYPE = "js";
exports.JS_TYPE = JS_TYPE;
var JSON_TYPE = "json";
exports.JSON_TYPE = JSON_TYPE;
var generators = {
    [JS_TYPE]: js_1.default,
    [JSON_TYPE]: json_1.default,
};
/**
 * Generate a JavaScript client module based on local `.graphql` files.
 *
 * See {gatherOperations} and {generateClientCode} for options.
 * @return {String} The generated JavaScript code
*/
function generateClient(options) {
    var payload = gatherOperations(options);
    var generatedCode = generateClientCode(options.client, payload.operations, options.clientType);
    return generatedCode;
}
exports.generateClient = generateClient;
/**
 * Parse files in the specified path and generate an alias for each operation.
*/
function gatherOperations(options) {
    var graphqlGlob = options.path || "./";
    // Check for file ext already, add it if missing
    var containsFileExt = graphqlGlob.indexOf(".graphql") > -1 || graphqlGlob.indexOf(".gql") > -1;
    if (!containsFileExt) {
        graphqlGlob = graphqlGlob + "**/*.graphql*";
    }
    var hashFunc = options.hash || md5_1.default;
    var filesMode = options.mode || (graphqlGlob.indexOf("__generated__") > -1 ? "relay" : "project");
    var addTypename = !!options.addTypename;
    var verbose = !!options.verbose;
    var operations = [];
    var filenames = (0, glob_1.globSync)(graphqlGlob, {}).sort();
    if (verbose) {
        console.log("[Sync] glob: ", graphqlGlob);
        console.log("[Sync] " + filenames.length + " files:");
        console.log(filenames.map(function (f) { return "[Sync]   - " + f; }).join("\n"));
    }
    if (filesMode == "relay") {
        operations = (0, prepareRelay_1.default)(filenames);
    }
    else {
        if (filesMode === "file") {
            operations = (0, prepareIsolatedFiles_1.default)(filenames, addTypename);
        }
        else if (filesMode === "project") {
            operations = (0, prepareProject_1.default)(filenames, addTypename);
        }
        else {
            throw new Error("Unexpected mode: " + filesMode);
        }
        // Update the operations with the hash of the body
        operations.forEach(function (op) {
            op.alias = hashFunc(op.body);
            // console.log("operation", op.alias, op.body)
        });
    }
    return { operations: operations };
}
exports.gatherOperations = gatherOperations;
/**
 * Given a map of { name => alias } pairs, generate outfile based on type.
 * @param {String} clientName - the client ID that this map belongs to
 * @param {Object} nameToAlias - `name => alias` pairs
 * @param {String} type - the outfile's type
 * @return {String} generated outfile code
*/
function generateClientCode(clientName, operations, type) {
    if (!clientName) {
        throw new Error("Client name is required to generate a persisted alias lookup map");
    }
    var nameToAlias = {};
    operations.forEach(function (op) {
        // This can be blank from relay-perisisted-output,
        // but typescript doesn't know that we don't use this function in that case
        // (Er, I should make _two_ interfaces, but I haven't yet.)
        if (op.name) {
            nameToAlias[op.name] = op.alias;
        }
    });
    // Build up the map
    var keyValuePairs = "{";
    keyValuePairs += Object.keys(nameToAlias).map(function (operationName) {
        var persistedAlias = nameToAlias[operationName];
        return "\n  \"" + operationName + "\": \"" + persistedAlias + "\"";
    }).join(",");
    keyValuePairs += "\n}";
    var outfileType = type || JS_TYPE;
    var generateOutfile = generators[outfileType];
    if (!generateOutfile) {
        throw new Error("Unknown generator type " + outfileType + " encountered for generating the outFile");
    }
    return generateOutfile(outfileType, clientName, keyValuePairs);
}
exports.generateClientCode = generateClientCode;
