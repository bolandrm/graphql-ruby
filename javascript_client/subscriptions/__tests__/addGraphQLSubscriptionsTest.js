"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addGraphQLSubscriptions_1 = __importDefault(require("../addGraphQLSubscriptions"));
describe("addGraphQLSubscriptions", () => {
    it("delegates to the subscriber", () => {
        var state = {};
        var subscriber = {
            subscribe: function (req, handler) {
                state[req] = handler;
                return req + "/" + handler;
            },
            unsubscribe(id) {
                var key = id.split("/")[0];
                delete state[key];
            }
        };
        var dummyNetworkInterface = (0, addGraphQLSubscriptions_1.default)({}, { subscriber: subscriber });
        var id = dummyNetworkInterface.subscribe("abc", "def");
        expect(id).toEqual("abc/def");
        expect(Object.keys(state).length).toEqual(1);
        expect(state["abc"]).toEqual("def");
        dummyNetworkInterface.unsubscribe(id);
        expect(Object.keys(state).length).toEqual(0);
    });
});
