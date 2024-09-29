"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generateClient_1 = require("../generateClient");
it("returns generated code", function () {
    var code = (0, generateClient_1.generateClient)({
        path: "./src/__tests__/documents/*.graphql",
        client: "test-client",
    });
    expect(code).toMatchSnapshot();
});
