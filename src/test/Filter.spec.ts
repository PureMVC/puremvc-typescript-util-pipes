import { Filter, Pipe, PipeListener } from "../plumbing/index.js";
import {
  IPipeMessage,
  PipeMessageType,
  FilterControlFunction,
  IPipeFitting,
  PropBag,
  FilterControlMessage,
  FilterControlMessageType,
  QueueControlMessageType,
} from "../index.js";

let messagesReceived: IPipeMessage[];
let callBackMethod: (message: IPipeMessage) => void;

/**
 * Test the Pipe class.
 */
describe("Filter Test", () => {
  describe("Filter plumbing tests", () => {
    test("Should implement IPipeFitting", () => {
      // create a pipe, casting to IPipeFitting
      const filter: IPipeFitting = new Filter({ name: "Test Filter" });

      // instance created
      expect(filter).toBeInstanceOf(Filter);
    });

    test("Should connect an IPipeFitting as its output", () => {
      // create two pipes
      const pipe: IPipeFitting = new Pipe();

      // Create a filter
      const filter: IPipeFitting = new Filter({ name: "Test Filter" });

      // Connect filter to pipe
      const connected: boolean = filter.connect(pipe);

      // they should be connected
      expect(connected).toBe(true);
    });

    test("Should be connectable to other IPipeFittings", () => {
      // create two pipes
      const pipe: IPipeFitting = new Pipe();

      // Create a filter
      const filter: IPipeFitting = new Filter({ name: "Test Filter" });

      // Connect the filter to pipe 1
      const connectedInput: boolean = pipe.connect(filter);

      // they should be connected
      expect(connectedInput).toBe(true);
    });

    test("Should disconnect its output fitting", () => {
      // create a pipe
      const pipe: IPipeFitting = new Pipe();

      // Create a filter
      const filter: IPipeFitting = new Filter({ name: "Test Filter" });

      // Connect the filter output to the pipe
      const connected: boolean = filter.connect(pipe);

      // they should be connected
      expect(connected).toBe(true);

      // disconnect pipe from the filter
      const disconnectedPipe = filter.disconnect() as IPipeFitting;
      expect(disconnectedPipe).toBe(pipe);

      // no filter output remains connected
      const noOutput = filter.disconnect() as IPipeFitting;
      expect(noOutput).toBe(undefined);
    });
  });

  describe("Filter message tests", () => {
    beforeEach(() => {
      messagesReceived = new Array<IPipeMessage>();

      callBackMethod = (message: IPipeMessage) => {
        messagesReceived.push(message);
      };
    });

    test("Should apply a filter that modifies a normal message header", () => {
      // create a message
      const message: IPipeMessage = {
        type: PipeMessageType.NORMAL,
        header: { width: 10, height: 2 },
      };

      const scale: FilterControlFunction = (
        message: IPipeMessage,
        params: PropBag,
      ) => {
        let width: number = (message?.header?.width as number) || 0;
        let height: number = (message?.header?.height as number) || 0;
        const factor: number = (params?.factor as number) || 0;
        width = width * factor;
        height = height * factor;
        message.header = { width, height };
        return true;
      };

      const filter: IPipeFitting = new Filter({
        name: "Scale",
        output: new PipeListener(callBackMethod),
        params: { factor: 10 },
        filter: scale,
      });

      const written: boolean = filter.write(message);
      expect(written).toBe(true);

      const received: IPipeMessage = messagesReceived.shift() as IPipeMessage;
      expect(received).toBe(message);
      expect(received.header?.width).toBe(100);
      expect(received.header?.height).toBe(20);
    });

    test("Should apply a filter that modifies a normal message body", () => {
      // create a message
      const message: IPipeMessage = {
        type: PipeMessageType.NORMAL,
        body: { width: 10, height: 2 },
      };

      const scale: FilterControlFunction = (
        message: IPipeMessage,
        params: PropBag,
      ) => {
        let width: number = (message?.body?.width as number) || 0;
        let height: number = (message?.body?.height as number) || 0;
        const factor: number = (params?.factor as number) || 0;
        width = width * factor;
        height = height * factor;
        message.body = { width, height };
        return true;
      };

      const filter: IPipeFitting = new Filter({
        name: "Scale",
        output: new PipeListener(callBackMethod),
        params: { factor: 10 },
        filter: scale,
      });

      const written: boolean = filter.write(message);
      expect(written).toBe(true);

      const received: IPipeMessage = messagesReceived.shift() as IPipeMessage;
      expect(received).toBe(message);
      expect(received.body?.width).toBe(100);
      expect(received.body?.height).toBe(20);
    });

    test("Should receive and respect FilterControlMessageType.BYPASS", () => {
      // create a message
      const message: IPipeMessage = {
        type: PipeMessageType.NORMAL,
        body: { width: 10, height: 2 },
      };

      // Create the filter control function
      const scale: FilterControlFunction = (
        message: IPipeMessage,
        params: PropBag,
      ) => {
        let width: number = (message?.body?.width as number) || 0;
        let height: number = (message?.body?.height as number) || 0;
        const factor: number = (params?.factor as number) || 0;
        width = width * factor;
        height = height * factor;
        message.body = { width, height };
        return true;
      };

      // Create the filter
      const filter: IPipeFitting = new Filter({
        name: "Scale",
        output: new PipeListener(callBackMethod),
        params: { factor: 10 },
        filter: scale,
      });

      const listener = new PipeListener(callBackMethod);
      filter.connect(listener);

      // create bypass control message
      let bypassMessage: FilterControlMessage = {
        type: FilterControlMessageType.BYPASS,
        name: "Scale",
      };

      // Send the bypass control message to the filter
      const bypassWritten: boolean = filter.write(bypassMessage);
      expect(bypassWritten).toBe(true);

      // Send the normal message to the filter
      const messageWritten: boolean = filter.write(message);
      expect(messageWritten).toBe(true);

      // Message should not be modified
      const received: IPipeMessage = messagesReceived.pop() as IPipeMessage;
      expect(received.body?.width).toBe(10);
      expect(received.body?.height).toBe(2);
    });

    test("Should exit BYPASS mode when FilterControlMessageType.FILTER is set", () => {
      // create a message
      const message: IPipeMessage = {
        type: PipeMessageType.NORMAL,
        body: { width: 10, height: 2 },
      };

      // Create the filter control function
      const scale: FilterControlFunction = (
        message: IPipeMessage,
        params: PropBag,
      ) => {
        let width: number = (message?.body?.width as number) || 0;
        let height: number = (message?.body?.height as number) || 0;
        const factor: number = (params?.factor as number) || 0;
        width = width * factor;
        height = height * factor;
        message.body = { width, height };
        return true;
      };

      // Create the filter
      const filter: IPipeFitting = new Filter({
        name: "Scale",
        output: new PipeListener(callBackMethod),
        params: { factor: 10 },
        filter: scale,
      });

      const listener = new PipeListener(callBackMethod);
      filter.connect(listener);

      // create bypass control message
      let bypassMessage: FilterControlMessage = {
        type: FilterControlMessageType.BYPASS,
        name: "Scale",
      };

      // Send the bypass control message to the filter, putting it into bypass mode
      const bypassWritten: boolean = filter.write(bypassMessage);
      expect(bypassWritten).toBe(true);

      // create filter control message
      let filterMessage: FilterControlMessage = {
        type: FilterControlMessageType.FILTER,
        name: "Scale",
      };

      // Send the control message to the filter, putting back into filter mode
      const filterMessageWritten: boolean = filter.write(filterMessage);
      expect(filterMessageWritten).toBe(true);

      // Send the normal message to the filter
      const messageWritten: boolean = filter.write(message);
      expect(messageWritten).toBe(true);

      // Message should be modified
      const received: IPipeMessage = messagesReceived.pop() as IPipeMessage;
      expect(received.body?.width).toBe(100);
      expect(received.body?.height).toBe(20);
    });

    test("SET_PARAMS targeted updates params and affects subsequent NORMAL", () => {
      const received: IPipeMessage[] = [];
      const listener = new PipeListener((m) => received.push(m));

      const scale: FilterControlFunction = (message, params) => {
        const factor = (params?.factor as number) || 1;
        const body = message.body as { v?: number } | undefined;
        const v = body?.v ?? 0;
        message.body = { v: v * factor };
        return true;
      };

      const filter = new Filter({
        name: "Scaler",
        output: listener,
        filter: scale,
        params: { factor: 2 },
      });

      // change params to 5
      const setParams: FilterControlMessage = {
        type: FilterControlMessageType.SET_PARAMS,
        name: "Scaler",
        params: { factor: 5 },
      };
      expect(filter.write(setParams)).toBe(true);

      // send a normal message and ensure new params used
      const msg: IPipeMessage = {
        type: PipeMessageType.NORMAL,
        body: { v: 3 },
      };
      expect(filter.write(msg)).toBe(true);
      expect(received[0]).toBe(msg);
      expect((received[0].body as { v: number }).v).toBe(15);
    });

    test("SET_PARAMS non-targeted passes through and does not change params", () => {
      const received: IPipeMessage[] = [];
      const listener = new PipeListener((m) => received.push(m));
      const scale: FilterControlFunction = (message, params) => {
        const factor = (params?.factor as number) || 1;
        const body = message.body as { v?: number } | undefined;
        const v = body?.v ?? 0;
        message.body = { v: v * factor };
        return true;
      };
      const filter = new Filter({
        name: "Scaler",
        output: listener,
        filter: scale,
        params: { factor: 2 },
      });
      const ctrl: FilterControlMessage = {
        type: FilterControlMessageType.SET_PARAMS,
        name: "Other",
        params: { factor: 10 },
      };
      expect(filter.write(ctrl)).toBe(true);
      // control message should pass through
      expect(received[0]).toBe(ctrl);
      // params should remain unchanged (2), so result should be 6 not 30
      const msg: IPipeMessage = {
        type: PipeMessageType.NORMAL,
        body: { v: 3 },
      };
      expect(filter.write(msg)).toBe(true);
      expect((received[1].body as { v: number }).v).toBe(6);
    });

    test("SET_FILTER targeted updates filter function", () => {
      const received: IPipeMessage[] = [];
      const listener = new PipeListener((m) => received.push(m));
      const f1: FilterControlFunction = (message) => {
        message.body = { ok: 1 };
        return true;
      };
      const f2: FilterControlFunction = (message) => {
        message.body = { ok: 2 };
        return true;
      };
      const filter = new Filter({ name: "Swap", output: listener, filter: f1 });
      // swap to f2
      const setFilter: FilterControlMessage = {
        type: FilterControlMessageType.SET_FILTER,
        name: "Swap",
        filter: f2,
      };
      expect(filter.write(setFilter)).toBe(true);
      const msg: IPipeMessage = { type: PipeMessageType.NORMAL };
      expect(filter.write(msg)).toBe(true);
      expect(((received[0] as IPipeMessage).body as { ok: number }).ok).toBe(2);
    });

    test("SET_FILTER non-targeted passes through and does not change filter", () => {
      const received: IPipeMessage[] = [];
      const listener = new PipeListener((m) => received.push(m));
      const f1: FilterControlFunction = (message) => {
        message.body = { ok: 1 };
        return true;
      };
      const f2: FilterControlFunction = (message) => {
        message.body = { ok: 2 };
        return true;
      };
      const filter = new Filter({ name: "Swap", output: listener, filter: f1 });
      const setFilter: FilterControlMessage = {
        type: FilterControlMessageType.SET_FILTER,
        name: "Other",
        filter: f2,
      };
      expect(filter.write(setFilter)).toBe(true);
      expect(received[0]).toBe(setFilter);
      const msg: IPipeMessage = { type: PipeMessageType.NORMAL };
      expect(filter.write(msg)).toBe(true);
      expect(((received[1] as IPipeMessage).body as { ok: number }).ok).toBe(1);
    });

    test("Non-targeted BYPASS/FILTER messages pass through, do not change mode", () => {
      const received: IPipeMessage[] = [];
      const listener = new PipeListener((m) => received.push(m));
      const filter = new Filter({ name: "Target", output: listener });
      const bypass: FilterControlMessage = {
        type: FilterControlMessageType.BYPASS,
        name: "Other",
      };
      const filterMsg: FilterControlMessage = {
        type: FilterControlMessageType.FILTER,
        name: "Other",
      };
      expect(filter.write(bypass)).toBe(true);
      expect(received[0]).toBe(bypass);
      // still in FILTER mode, so normal message should be written unchanged (no filter)
      const msg: IPipeMessage = { type: PipeMessageType.NORMAL };
      expect(filter.write(msg)).toBe(true);
      expect(received[1]).toBe(msg);
      // send FILTER (non-targeted) and ensure it passes through
      expect(filter.write(filterMsg)).toBe(true);
      expect(received[2]).toBe(filterMsg);
    });

    test("Default branch: unrelated control message writes through", () => {
      const received: IPipeMessage[] = [];
      const listener = new PipeListener((m) => received.push(m));
      const filter = new Filter({ output: listener });
      const ctrl: IPipeMessage = { type: QueueControlMessageType.FLUSH };
      expect(filter.write(ctrl)).toBe(true);
      expect(received[0]).toBe(ctrl);
    });

    test("No output connected: write returns false", () => {
      const filter = new Filter({ name: "NoOut" });
      expect(filter.write({ type: PipeMessageType.NORMAL })).toBe(false);
      expect(
        filter.write({
          type: FilterControlMessageType.BYPASS,
          name: "NoOut",
        } as FilterControlMessage),
      ).toBe(true);
    });

    test("Non-targeted SET_PARAMS with no output returns false (write-through)", () => {
      const filter = new Filter({ name: "TargetOnly" });
      const ctrl: FilterControlMessage = {
        type: FilterControlMessageType.SET_PARAMS,
        name: "Other",
        params: { x: 1 },
      };
      expect(filter.write(ctrl)).toBe(false);
    });

    test("Non-targeted SET_FILTER with no output returns false (write-through)", () => {
      const filter = new Filter({ name: "TargetOnly" });
      const f: FilterControlFunction = () => true;
      const ctrl: FilterControlMessage = {
        type: FilterControlMessageType.SET_FILTER,
        name: "Other",
        filter: f,
      };
      expect(filter.write(ctrl)).toBe(false);
    });

    test("Non-targeted BYPASS/FILTER and unrelated control return false when no output", () => {
      const filter = new Filter({ name: "TargetOnly" });
      const bypass: FilterControlMessage = {
        type: FilterControlMessageType.BYPASS,
        name: "Other",
      };
      const filt: FilterControlMessage = {
        type: FilterControlMessageType.FILTER,
        name: "Other",
      };
      expect(filter.write(bypass)).toBe(false);
      expect(filter.write(filt)).toBe(false);
      // default branch with unrelated control message and no output
      const unrelated: IPipeMessage = { type: QueueControlMessageType.FLUSH };
      expect(filter.write(unrelated)).toBe(false);
    });

    test("Filter function throws: write returns false and swallows error", () => {
      const received: IPipeMessage[] = [];
      const listener = new PipeListener((m) => received.push(m));
      const bad: FilterControlFunction = () => {
        throw new Error("bad");
      };
      const filter = new Filter({ name: "Bad", output: listener, filter: bad });
      const msg: IPipeMessage = { type: PipeMessageType.NORMAL };
      expect(filter.write(msg)).toBe(false);
      expect(received.length).toBe(0);
    });

    test("No filter function set: FILTER mode writes through unchanged", () => {
      const received: IPipeMessage[] = [];
      const listener = new PipeListener((m) => received.push(m));
      const filter = new Filter({ name: "NoFunc", output: listener });
      // ensure in FILTER mode (default is FILTER)
      const msg: IPipeMessage = {
        type: PipeMessageType.NORMAL,
        body: { val: 7 },
      };
      expect(filter.write(msg)).toBe(true);
      expect(received[0]).toBe(msg);
      expect((received[0].body as { val: number }).val).toBe(7);
    });

    test("SET_PARAMS targeted with undefined params sets empty object", () => {
      const received: IPipeMessage[] = [];
      const listener = new PipeListener((m) => received.push(m));
      const scale: FilterControlFunction = (message, params) => {
        const factor = (params?.factor as number) || 1;
        message.body = { v: factor };
        return true;
      };
      const filter = new Filter({
        name: "Target",
        output: listener,
        filter: scale,
      });
      // send SET_PARAMS without params
      const ctrl: FilterControlMessage = {
        type: FilterControlMessageType.SET_PARAMS,
        name: "Target",
      };
      expect(filter.write(ctrl)).toBe(true);
      const msg: IPipeMessage = { type: PipeMessageType.NORMAL };
      expect(filter.write(msg)).toBe(true);
      // since params became {}, factor defaults to 1
      expect((received[0].body as { v: number }).v).toBe(1);
    });
  });
});
