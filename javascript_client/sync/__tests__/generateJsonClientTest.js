"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generateClient_1 = require("../generateClient");
function withExampleClient(callback) {
    // Generate some code and write it to a file
    var exampleOperations = [
        { name: "a", alias: "b", body: "" },
        { name: "c-d", alias: "e-f", body: "" }
    ];
    var json = (0, generateClient_1.generateClientCode)("example-client", exampleOperations, generateClient_1.JSON_TYPE);
    // Run callback with generated client
    callback(json);
}
it("generates a valid json object string that maps names to operations", () => {
    withExampleClient((json) => {
        expect(json).toMatchSnapshot(); // String version
        expect(JSON.parse(json)).toMatchSnapshot(); // Object version (i.e., valid JSON)
    });
});
