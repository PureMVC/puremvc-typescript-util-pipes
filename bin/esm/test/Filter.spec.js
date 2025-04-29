import { Filter, Pipe, PipeListener } from "../plumbing/";
import { PipeMessageType, FilterControlMessageType, } from "../types";
let messagesReceived;
let callBackMethod;
/**
 * Test the Pipe class.
 */
describe("Filter Test", () => {
    describe("Filter plumbing tests", () => {
        test("Should implement IPipeFitting", () => {
            // create a pipe, casting to IPipeFitting
            const filter = new Filter({ name: "Test Filter" });
            // instance created
            expect(filter).toBeInstanceOf(Filter);
        });
        test("Should connect an IPipeFitting as its output", () => {
            // create two pipes
            const pipe = new Pipe();
            // Create a filter
            const filter = new Filter({ name: "Test Filter" });
            // Connect filter to pipe
            const connected = filter.connect(pipe);
            // they should be connected
            expect(connected).toBe(true);
        });
        test("Should be connectable to other IPipeFittings", () => {
            // create two pipes
            const pipe = new Pipe();
            // Create a filter
            const filter = new Filter({ name: "Test Filter" });
            // Connect the filter to pipe 1
            const connectedInput = pipe.connect(filter);
            // they should be connected
            expect(connectedInput).toBe(true);
        });
        test("Should disconnect its output fitting", () => {
            // create a pipe
            const pipe = new Pipe();
            // Create a filter
            const filter = new Filter({ name: "Test Filter" });
            // Connect the filter output to the pipe
            const connected = filter.connect(pipe);
            // they should be connected
            expect(connected).toBe(true);
            // disconnect pipe from the filter
            const disconnectedPipe = filter.disconnect();
            expect(disconnectedPipe).toBe(pipe);
            // no filter output remains connected
            const noOutput = filter.disconnect();
            expect(noOutput).toBe(undefined);
        });
    });
    describe("Filter message tests", () => {
        beforeEach(() => {
            messagesReceived = new Array();
            callBackMethod = (message) => {
                messagesReceived.push(message);
            };
        });
        test("Should apply a filter that modifies a normal message header", () => {
            var _a, _b;
            // create a message
            const message = {
                type: PipeMessageType.NORMAL,
                header: { width: 10, height: 2 },
            };
            const scale = (message, params) => {
                var _a, _b;
                let width = ((_a = message === null || message === void 0 ? void 0 : message.header) === null || _a === void 0 ? void 0 : _a.width) || 0;
                let height = ((_b = message === null || message === void 0 ? void 0 : message.header) === null || _b === void 0 ? void 0 : _b.height) || 0;
                const factor = (params === null || params === void 0 ? void 0 : params.factor) || 0;
                width = width * factor;
                height = height * factor;
                message.header = { width, height };
                return true;
            };
            const filter = new Filter({
                name: "Scale",
                output: new PipeListener(callBackMethod),
                params: { factor: 10 },
                filter: scale,
            });
            const written = filter.write(message);
            expect(written).toBe(true);
            const received = messagesReceived.shift();
            expect(received).toBe(message);
            expect((_a = received.header) === null || _a === void 0 ? void 0 : _a.width).toBe(100);
            expect((_b = received.header) === null || _b === void 0 ? void 0 : _b.height).toBe(20);
        });
        test("Should apply a filter that modifies a normal message body", () => {
            var _a, _b;
            // create a message
            const message = {
                type: PipeMessageType.NORMAL,
                body: { width: 10, height: 2 },
            };
            const scale = (message, params) => {
                var _a, _b;
                let width = ((_a = message === null || message === void 0 ? void 0 : message.body) === null || _a === void 0 ? void 0 : _a.width) || 0;
                let height = ((_b = message === null || message === void 0 ? void 0 : message.body) === null || _b === void 0 ? void 0 : _b.height) || 0;
                const factor = (params === null || params === void 0 ? void 0 : params.factor) || 0;
                width = width * factor;
                height = height * factor;
                message.body = { width, height };
                return true;
            };
            const filter = new Filter({
                name: "Scale",
                output: new PipeListener(callBackMethod),
                params: { factor: 10 },
                filter: scale,
            });
            const written = filter.write(message);
            expect(written).toBe(true);
            const received = messagesReceived.shift();
            expect(received).toBe(message);
            expect((_a = received.body) === null || _a === void 0 ? void 0 : _a.width).toBe(100);
            expect((_b = received.body) === null || _b === void 0 ? void 0 : _b.height).toBe(20);
        });
        test("Should receive and respect FilterControlMessageType.BYPASS", () => {
            var _a, _b;
            // create a message
            const message = {
                type: PipeMessageType.NORMAL,
                body: { width: 10, height: 2 },
            };
            // Create the filter control function
            const scale = (message, params) => {
                var _a, _b;
                let width = ((_a = message === null || message === void 0 ? void 0 : message.body) === null || _a === void 0 ? void 0 : _a.width) || 0;
                let height = ((_b = message === null || message === void 0 ? void 0 : message.body) === null || _b === void 0 ? void 0 : _b.height) || 0;
                const factor = (params === null || params === void 0 ? void 0 : params.factor) || 0;
                width = width * factor;
                height = height * factor;
                message.body = { width, height };
                return true;
            };
            // Create the filter
            const filter = new Filter({
                name: "Scale",
                output: new PipeListener(callBackMethod),
                params: { factor: 10 },
                filter: scale,
            });
            const listener = new PipeListener(callBackMethod);
            filter.connect(listener);
            // create bypass control message
            let bypassMessage = {
                type: FilterControlMessageType.BYPASS,
                name: "Scale",
            };
            // Send the bypass control message to the filter
            const bypassWritten = filter.write(bypassMessage);
            expect(bypassWritten).toBe(true);
            // Send the normal message to the filter
            const messageWritten = filter.write(message);
            expect(messageWritten).toBe(true);
            // Message should not be modified
            const received = messagesReceived.pop();
            expect((_a = received.body) === null || _a === void 0 ? void 0 : _a.width).toBe(10);
            expect((_b = received.body) === null || _b === void 0 ? void 0 : _b.height).toBe(2);
        });
        test("Should exit BYPASS mode when FilterControlMessageType.FILTER is set", () => {
            var _a, _b;
            // create a message
            const message = {
                type: PipeMessageType.NORMAL,
                body: { width: 10, height: 2 },
            };
            // Create the filter control function
            const scale = (message, params) => {
                var _a, _b;
                let width = ((_a = message === null || message === void 0 ? void 0 : message.body) === null || _a === void 0 ? void 0 : _a.width) || 0;
                let height = ((_b = message === null || message === void 0 ? void 0 : message.body) === null || _b === void 0 ? void 0 : _b.height) || 0;
                const factor = (params === null || params === void 0 ? void 0 : params.factor) || 0;
                width = width * factor;
                height = height * factor;
                message.body = { width, height };
                return true;
            };
            // Create the filter
            const filter = new Filter({
                name: "Scale",
                output: new PipeListener(callBackMethod),
                params: { factor: 10 },
                filter: scale,
            });
            const listener = new PipeListener(callBackMethod);
            filter.connect(listener);
            // create bypass control message
            let bypassMessage = {
                type: FilterControlMessageType.BYPASS,
                name: "Scale",
            };
            // Send the bypass control message to the filter, putting it into bypass mode
            const bypassWritten = filter.write(bypassMessage);
            expect(bypassWritten).toBe(true);
            // create filter control message
            let filterMessage = {
                type: FilterControlMessageType.FILTER,
                name: "Scale",
            };
            // Send the control message to the filter, putting back into filter mode
            const filterMessageWritten = filter.write(filterMessage);
            expect(filterMessageWritten).toBe(true);
            // Send the normal message to the filter
            const messageWritten = filter.write(message);
            expect(messageWritten).toBe(true);
            // Message should be modified
            const received = messagesReceived.pop();
            expect((_a = received.body) === null || _a === void 0 ? void 0 : _a.width).toBe(100);
            expect((_b = received.body) === null || _b === void 0 ? void 0 : _b.height).toBe(20);
        });
    });
});
