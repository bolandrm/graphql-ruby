"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const createAblyHandler_1 = require("../createAblyHandler");
const ably_1 = require("ably");
const dummyOperation = { text: "", name: "" };
const channelTemplate = {
    presence: {
        enter() { },
        enterClient() { },
        leave(callback) {
            if (callback)
                callback();
        }
    },
    subscribe: () => { },
    unsubscribe: () => { },
    on: () => { },
    detach: (callback) => {
        if (callback)
            callback();
    }
};
const createDummyConsumer = (channel = channelTemplate, release = (_channelName) => { }) => ({
    auth: { clientId: "foo" },
    channels: {
        get: () => channel,
        release
    }
});
const nextTick = () => new Promise(resolve => setTimeout(resolve, 0));
describe("createAblyHandler", () => {
    it("returns a function producing a disposable subscription", () => __awaiter(void 0, void 0, void 0, function* () {
        const subscriptionId = "dummy-subscription";
        var wasUnsubscribed = false;
        var wasDetached = false;
        var releasedChannelName;
        const producer = (0, createAblyHandler_1.createAblyHandler)({
            fetchOperation: () => new Promise(resolve => resolve({
                headers: new Map([["X-Subscription-ID", subscriptionId]]),
                body: { data: { foo: "bar" } }
            })),
            ably: createDummyConsumer(Object.assign(Object.assign({}, channelTemplate), { unsubscribe: () => {
                    wasUnsubscribed = true;
                }, detach: (callback) => {
                    if (callback)
                        callback();
                    wasDetached = true;
                }, name: subscriptionId }), (channelName) => {
                releasedChannelName = channelName;
            })
        });
        const subscription = producer(dummyOperation, {}, {}, { onError: () => { }, onNext: () => { }, onCompleted: () => { } });
        yield nextTick();
        yield subscription.dispose();
        expect(wasUnsubscribed).toEqual(true);
        expect(wasDetached).toEqual(true);
        expect(releasedChannelName).toEqual(subscriptionId);
    }));
    it("dispatches the immediate response in case of success", () => __awaiter(void 0, void 0, void 0, function* () {
        let errorInvokedWith = undefined;
        let nextInvokedWith = undefined;
        const producer = (0, createAblyHandler_1.createAblyHandler)({
            fetchOperation: () => new Promise(resolve => resolve({
                headers: new Map([["X-Subscription-ID", "foo"]]),
                body: { data: { foo: "bar" } }
            })),
            ably: createDummyConsumer()
        });
        producer(dummyOperation, {}, {}, {
            onError: (errors) => {
                errorInvokedWith = errors;
            },
            onNext: (response) => {
                nextInvokedWith = response;
            },
            onCompleted: () => { }
        });
        yield nextTick();
        expect(errorInvokedWith).toBeUndefined();
        expect(nextInvokedWith).toEqual({ data: { foo: "bar" } });
    }));
    it("dispatches the immediate response in case of error", () => __awaiter(void 0, void 0, void 0, function* () {
        let errorInvokedWith = undefined;
        let nextInvokedWith = undefined;
        const dummyErrors = [{ message: "baz" }];
        const producer = (0, createAblyHandler_1.createAblyHandler)({
            fetchOperation: () => new Promise(resolve => resolve({
                headers: new Map([["X-Subscription-ID", "foo"]]),
                body: { errors: dummyErrors }
            })),
            ably: createDummyConsumer()
        });
        producer(dummyOperation, {}, {}, {
            onError: (errors) => {
                errorInvokedWith = errors;
            },
            onNext: () => { },
            onCompleted: () => { }
        });
        yield nextTick();
        expect(errorInvokedWith).toEqual(dummyErrors);
        expect(nextInvokedWith).toBeUndefined();
    }));
    it("doesn't dispatch anything for an empty response", () => __awaiter(void 0, void 0, void 0, function* () {
        let errorInvokedWith = undefined;
        let nextInvokedWith = undefined;
        const producer = (0, createAblyHandler_1.createAblyHandler)({
            fetchOperation: () => new Promise(resolve => resolve({
                headers: new Map([["X-Subscription-ID", "foo"]]),
                body: {}
            })),
            ably: createDummyConsumer()
        });
        producer(dummyOperation, {}, {}, {
            onError: (errors) => {
                errorInvokedWith = errors;
            },
            onNext: (response) => {
                nextInvokedWith = response;
            },
            onCompleted: () => { }
        });
        yield nextTick();
        expect(errorInvokedWith).toBeUndefined();
        expect(nextInvokedWith).toBeUndefined();
    }));
    it("doesn't dispatch anything for an empty data object", () => __awaiter(void 0, void 0, void 0, function* () {
        let errorInvokedWith = undefined;
        let nextInvokedWith = undefined;
        const producer = (0, createAblyHandler_1.createAblyHandler)({
            fetchOperation: () => new Promise(resolve => resolve({
                headers: new Map([["X-Subscription-ID", "foo"]]),
                body: { data: {} }
            })),
            ably: createDummyConsumer()
        });
        producer(dummyOperation, {}, {}, {
            onError: (errors) => {
                errorInvokedWith = errors;
            },
            onNext: (response) => {
                nextInvokedWith = response;
            },
            onCompleted: () => { }
        });
        yield nextTick();
        expect(errorInvokedWith).toBeUndefined();
        expect(nextInvokedWith).toBeUndefined();
    }));
    it("dispatches caught errors", () => __awaiter(void 0, void 0, void 0, function* () {
        let errorInvokedWith = undefined;
        let nextInvokedWith = undefined;
        const error = new Error("blam");
        const producer = (0, createAblyHandler_1.createAblyHandler)({
            fetchOperation: () => new Promise((_resolve, reject) => reject(error)),
            ably: createDummyConsumer()
        });
        producer(dummyOperation, {}, {}, {
            onError: (errors) => {
                errorInvokedWith = errors;
            },
            onNext: (response) => {
                nextInvokedWith = response;
            },
            onCompleted: () => { }
        });
        yield nextTick();
        expect(errorInvokedWith).toBe(error);
        expect(nextInvokedWith).toBeUndefined();
    }));
    it("detaches the channel when the subscription is disposed during initial response", () => __awaiter(void 0, void 0, void 0, function* () {
        let detached = false;
        const ably = createDummyConsumer(Object.assign(Object.assign({}, channelTemplate), { detach() {
                detached = true;
            } }));
        const producer = (0, createAblyHandler_1.createAblyHandler)({
            fetchOperation: () => new Promise(resolve => resolve({
                headers: new Map([["X-Subscription-ID", "foo"]]),
                body: { errors: {} }
            })),
            ably
        });
        const { dispose } = producer(dummyOperation, {}, {}, {
            onError: () => __awaiter(void 0, void 0, void 0, function* () {
                dispose();
            }),
            onNext: () => __awaiter(void 0, void 0, void 0, function* () { }),
            onCompleted: () => { }
        });
        yield nextTick();
        expect(detached).toBe(true);
    }));
    describe("integration with Ably", () => {
        const key = process.env.ABLY_KEY;
        const testWithAblyKey = key ? test : test.skip;
        test("onError is called when using invalid key", () => __awaiter(void 0, void 0, void 0, function* () {
            const ably = new ably_1.Realtime({
                key: "integration-test:invalid",
                log: { level: 0 }
            });
            yield new Promise(resolve => {
                const fetchOperation = () => __awaiter(void 0, void 0, void 0, function* () {
                    return ({
                        headers: new Map([["X-Subscription-ID", "foo"]])
                    });
                });
                const ablyHandler = (0, createAblyHandler_1.createAblyHandler)({ ably, fetchOperation });
                const operation = {};
                const variables = {};
                const cacheConfig = {};
                const onError = (error) => {
                    expect(error.message).toMatch(/Invalid key in request/);
                    resolve();
                };
                const onNext = () => console.log("onNext");
                const onCompleted = () => console.log("onCompleted");
                const observer = {
                    onError,
                    onNext,
                    onCompleted
                };
                ablyHandler(operation, variables, cacheConfig, observer);
            });
            ably.close();
        }));
        // For executing this test you need to provide a valid Ably API key in
        // environment variable ABLY_KEY
        testWithAblyKey("onError is called for too many subscriptions", () => __awaiter(void 0, void 0, void 0, function* () {
            const ably = new ably_1.Realtime({ key, log: { level: 0 } });
            yield new Promise(resolve => {
                let subscriptionCounter = 0;
                const fetchOperation = () => __awaiter(void 0, void 0, void 0, function* () {
                    subscriptionCounter += 1;
                    return {
                        headers: new Map([
                            ["X-Subscription-ID", `foo-${subscriptionCounter}`]
                        ])
                    };
                });
                const ablyHandler = (0, createAblyHandler_1.createAblyHandler)({ ably, fetchOperation });
                const operation = {};
                const variables = {};
                const cacheConfig = {};
                const onError = (error) => {
                    expect(error.message).toMatch(/Maximum number of channels/);
                    resolve();
                };
                const onNext = () => console.log("onNext");
                const onCompleted = () => console.log("onCompleted");
                const observer = {
                    onError,
                    onNext,
                    onCompleted
                };
                for (let i = 0; i < 201; ++i) {
                    ablyHandler(operation, variables, cacheConfig, observer);
                }
            });
            ably.close();
        }));
        // For executing this test you need to provide a valid Ably API key in
        // environment variable ABLY_KEY
        //
        // This test might take longer than the default jest timeout of 5s.
        // Consider setting a higher timeout when running in CI.
        testWithAblyKey("can make more than 200 subscriptions", () => __awaiter(void 0, void 0, void 0, function* () {
            let caughtError = null;
            const ably = new ably_1.Realtime({ key, log: { level: 0 } });
            let subscriptionCounter = 0;
            const fetchOperation = () => __awaiter(void 0, void 0, void 0, function* () {
                subscriptionCounter += 1;
                return {
                    headers: new Map([
                        ["X-Subscription-ID", `foo-${subscriptionCounter}`]
                    ])
                };
            });
            const ablyHandler = (0, createAblyHandler_1.createAblyHandler)({ ably, fetchOperation });
            const operation = {};
            const variables = {};
            const cacheConfig = {};
            const onError = (error) => {
                caughtError = error;
            };
            const onNext = () => { };
            const onCompleted = () => { };
            const observer = {
                onError,
                onNext,
                onCompleted
            };
            const disposals = [];
            for (let i = 0; i < 200; ++i) {
                const { dispose } = ablyHandler(operation, variables, cacheConfig, observer);
                yield new Promise(resolve => setTimeout(resolve, 0));
                disposals.push(dispose());
            }
            yield Promise.all(disposals);
            // 201st subscription - should work now that previous 200 subscriptions have been disposed
            const { dispose } = ablyHandler(operation, variables, cacheConfig, observer);
            yield new Promise(resolve => setTimeout(resolve, 0));
            yield dispose();
            ably.close();
            if (caughtError)
                throw caughtError;
        }));
        // For executing this test you need to provide a valid Ably API key in
        // environment variable ABLY_KEY
        testWithAblyKey("receives message sent before subscribe takes effect", () => __awaiter(void 0, void 0, void 0, function* () {
            let caughtError = null;
            const ably = new ably_1.Realtime({ key, log: { level: 0 } });
            ably.connect();
            const subscriptionId = Math.random().toString(36);
            const fetchOperation = () => __awaiter(void 0, void 0, void 0, function* () {
                return ({
                    headers: new Map([["X-Subscription-ID", subscriptionId]]),
                    body: { data: "immediateResult" }
                });
            });
            const ablyHandler = (0, createAblyHandler_1.createAblyHandler)({ ably, fetchOperation });
            const operation = {};
            const variables = {};
            const cacheConfig = {};
            const onError = (error) => {
                caughtError = error;
            };
            const messages = [];
            const onNext = (message) => {
                messages.push(message.data);
            };
            const onCompleted = () => { };
            const observer = {
                onError,
                onNext,
                onCompleted
            };
            // Publish before subscribe
            yield new Promise((resolve, reject) => {
                const ablyPublisher = new ably_1.Realtime({ key, log: { level: 0 } });
                const publishChannel = ablyPublisher.channels.get(subscriptionId);
                publishChannel.publish("update", {
                    result: { data: "asyncResult" }
                }, err => {
                    ablyPublisher.close();
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
            const { dispose } = ablyHandler(operation, variables, cacheConfig, observer);
            for (let i = 0; i < 20 && messages.length < 2; ++i) {
                yield new Promise(resolve => setTimeout(resolve, 100));
            }
            yield dispose();
            ably.close();
            if (caughtError)
                throw caughtError;
            expect(messages).toEqual(["immediateResult", "asyncResult"]);
        }));
    });
});
