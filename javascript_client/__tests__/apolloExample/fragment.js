"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MORE_FIELDS = void 0;
const client_1 = require("@apollo/client");
exports.MORE_FIELDS = (0, client_1.gql) `
fragment MoreFields on Query { __typename }
`;
