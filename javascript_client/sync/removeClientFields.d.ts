import { DocumentNode } from "graphql";
declare function removeClientFields(node: DocumentNode): DocumentNode;
declare function removeClientFieldsFromString(body: string): string;
export { removeClientFields, removeClientFieldsFromString };
