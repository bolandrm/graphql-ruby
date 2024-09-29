"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UPDATE_SOMETHING = void 0;
const client_1 = require("@apollo/client");
exports.UPDATE_SOMETHING = (0, client_1.gql) `
mutation UpdateSomething($name: String!) {
  updateSomething(name: $name) { name }
}
`;
