"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const registry_1 = __importDefault(require("../registry"));
describe("subscription registry", () => {
    it("adds and unsubscribes", () => {
        // A subscription is something that responds to `.unsubscribe`
        var wasUnsubscribed1 = false;
        var subscription1 = {
            unsubscribe: function () {
                wasUnsubscribed1 = true;
            }
        };
        var wasUnsubscribed2 = false;
        var subscription2 = {
            unsubscribe: function () {
                wasUnsubscribed2 = true;
            }
        };
        // Adding a subscription returns an ID for unsubscribing
        var id1 = registry_1.default.add(subscription1);
        var id2 = registry_1.default.add(subscription2);
        expect(typeof id1).toEqual("number");
        expect(typeof id2).toEqual("number");
        // Unsubscribing calls the `.unsubscribe `function
        registry_1.default.unsubscribe(id1);
        expect(wasUnsubscribed1).toEqual(true);
        expect(wasUnsubscribed2).toEqual(false);
        registry_1.default.unsubscribe(id2);
        expect(wasUnsubscribed1).toEqual(true);
        expect(wasUnsubscribed2).toEqual(true);
    });
    it("raises on unknown ids", () => {
        expect(() => {
            registry_1.default.unsubscribe(999);
        }).toThrow("No subscription found for id: 999");
    });
});
