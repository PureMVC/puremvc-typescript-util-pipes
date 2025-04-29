import { Filter, Pipe, PipeListener } from "../plumbing/";
import {
  IPipeMessage,
  PipeMessageType,
  FilterControlFunction,
  IPipeFitting,
  PropBag,
  FilterControlMessage, FilterControlMessageType
} from "../types";

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
      }

    })

    test("Should apply a filter that modifies a normal message header", () => {

      // create a message
      const message: IPipeMessage = {
        type: PipeMessageType.NORMAL,
        header: { width: 10, height: 2 },
      };

      const scale: FilterControlFunction =
        (message: IPipeMessage, params: PropBag) => {
          let width: number = message?.header?.width as number || 0;
          let height: number = message?.header?.height as number || 0;
          const factor: number = params?.factor as number || 0;
          width = width * factor;
          height = height * factor;
          message.header = { width, height }
          return true;
        }

      const filter: IPipeFitting = new Filter({
        name: "Scale",
        output: new PipeListener(callBackMethod),
        params: { factor: 10 },
        filter: scale
      });

      const written: boolean = filter.write(message);
      expect(written).toBe(true)

      const received: IPipeMessage = messagesReceived.shift() as IPipeMessage;
      expect(received).toBe(message);
      expect(received.header?.width).toBe(100);
      expect(received.header?.height).toBe(20);

    })

    test("Should apply a filter that modifies a normal message body", () => {

      // create a message
      const message: IPipeMessage = {
        type: PipeMessageType.NORMAL,
        body: { width: 10, height: 2 },
      };

      const scale: FilterControlFunction =
        (message: IPipeMessage, params: PropBag) => {
          let width: number = message?.body?.width as number || 0;
          let height: number = message?.body?.height as number || 0;
          const factor: number = params?.factor as number || 0;
          width = width * factor;
          height = height * factor;
          message.body = { width, height }
          return true;
        }

      const filter: IPipeFitting = new Filter({
        name: "Scale",
        output: new PipeListener(callBackMethod),
        params: { factor: 10 },
        filter: scale
      });

      const written: boolean = filter.write(message);
      expect(written).toBe(true)

      const received: IPipeMessage = messagesReceived.shift() as IPipeMessage;
      expect(received).toBe(message);
      expect(received.body?.width).toBe(100);
      expect(received.body?.height).toBe(20);

    })

    test("Should receive and respect FilterControlMessageType.BYPASS", () => {

      // create a message
      const message: IPipeMessage = {
        type: PipeMessageType.NORMAL,
        body: { width: 10, height: 2 },
      };

      // Create the filter control function
      const scale: FilterControlFunction =
        (message: IPipeMessage, params: PropBag) => {
          let width: number = message?.body?.width as number || 0;
          let height: number = message?.body?.height as number || 0;
          const factor: number = params?.factor as number || 0;
          width = width * factor;
          height = height * factor;
          message.body = { width, height }
          return true;
        }

      // Create the filter
      const filter: IPipeFitting = new Filter({
        name: 'Scale',
        output: new PipeListener(callBackMethod),
        params: { factor: 10 },
        filter: scale
      });

      const listener = new PipeListener(callBackMethod);
      filter.connect(listener);

      // create bypass control message
      let bypassMessage: FilterControlMessage = {
        type: FilterControlMessageType.BYPASS,
        name: 'Scale'
      };

      // Send the bypass control message to the filter
      const bypassWritten: boolean = filter.write(bypassMessage);
      expect(bypassWritten).toBe(true)

      // Send the normal message to the filter
      const messageWritten: boolean = filter.write(message);
      expect(messageWritten).toBe(true)

      // Message should not be modified
      const received: IPipeMessage = messagesReceived.pop() as IPipeMessage;
      expect(received.body?.width).toBe(10);
      expect(received.body?.height).toBe(2);

    })

    test("Should exit BYPASS mode when FilterControlMessageType.FILTER is set", () => {

      // create a message
      const message: IPipeMessage = {
        type: PipeMessageType.NORMAL,
        body: { width: 10, height: 2 },
      };

      // Create the filter control function
      const scale: FilterControlFunction =
        (message: IPipeMessage, params: PropBag) => {
          let width: number = message?.body?.width as number || 0;
          let height: number = message?.body?.height as number || 0;
          const factor: number = params?.factor as number || 0;
          width = width * factor;
          height = height * factor;
          message.body = { width, height }
          return true;
        }

      // Create the filter
      const filter: IPipeFitting = new Filter({
        name: 'Scale',
        output: new PipeListener(callBackMethod),
        params: { factor: 10 },
        filter: scale
      });

      const listener = new PipeListener(callBackMethod);
      filter.connect(listener);

      // create bypass control message
      let bypassMessage: FilterControlMessage = {
        type: FilterControlMessageType.BYPASS,
        name: 'Scale'
      };

      // Send the bypass control message to the filter, putting it into bypass mode
      const bypassWritten: boolean = filter.write(bypassMessage);
      expect(bypassWritten).toBe(true);

      // create filter control message
      let filterMessage: FilterControlMessage = {
        type: FilterControlMessageType.FILTER,
        name: 'Scale'
      };

      // Send the control message to the filter, putting back into filter mode
      const filterMessageWritten: boolean = filter.write(filterMessage);
      expect(filterMessageWritten).toBe(true);

      // Send the normal message to the filter
      const messageWritten: boolean = filter.write(message);
      expect(messageWritten).toBe(true)


      // Message should be modified
      const received: IPipeMessage = messagesReceived.pop() as IPipeMessage;
      expect(received.body?.width).toBe(100);
      expect(received.body?.height).toBe(20);

    })
  })

})
