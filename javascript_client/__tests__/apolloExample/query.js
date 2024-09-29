"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET_HELLO_WORLD = void 0;
const client_1 = require("@apollo/client");
const fragment_1 = require("./fragment");
exports.GET_HELLO_WORLD = (0, client_1.gql) `
query getHelloWorld {
  helloWorld
  ... MoreFields
}
${fragment_1.MORE_FIELDS}
`;
