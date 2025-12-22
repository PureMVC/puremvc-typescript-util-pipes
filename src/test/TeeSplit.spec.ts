import { Pipe, TeeSplit, PipeListener } from "../plumbing/index.js";
import { IPipeFitting, IPipeMessage, PipeMessageType } from "../index.js";

describe("TeeSplit Test", () => {
  test("Connect and disconnect I/O pipes (LIFO disconnect)", () => {
    const input1: IPipeFitting = new Pipe();
    const pipe1: IPipeFitting = new Pipe();
    const pipe2: IPipeFitting = new Pipe();
    const pipe3: IPipeFitting = new Pipe();
    const pipe4: IPipeFitting = new Pipe();

    const teeSplit: TeeSplit = new TeeSplit(pipe1, pipe2);

    const connectedExtra1 = teeSplit.connect(pipe3);
    const connectedExtra2 = teeSplit.connect(pipe4);

    const inputConnected = input1.connect(teeSplit);

    expect(pipe1).toBeInstanceOf(Pipe);
    expect(pipe2).toBeInstanceOf(Pipe);
    expect(pipe3).toBeInstanceOf(Pipe);
    expect(pipe4).toBeInstanceOf(Pipe);
    expect(teeSplit instanceof TeeSplit).toBe(true);
    expect(connectedExtra1).toBe(true);
    expect(connectedExtra2).toBe(true);
    expect(inputConnected).toBe(true);

    // LIFO disconnect order
    expect(teeSplit.disconnect()).toBe(pipe4);
    expect(teeSplit.disconnect()).toBe(pipe3);
    expect(teeSplit.disconnect()).toBe(pipe2);
    expect(teeSplit.disconnect()).toBe(pipe1);
  });

  test("disconnectFitting removes only the targeted outputs and fan-out works", () => {
    const messagesReceived: IPipeMessage[] = [];

    const input1: IPipeFitting = new Pipe();
    const pipe1: IPipeFitting = new Pipe(
      new PipeListener((m) => messagesReceived.push(m)),
    );
    const pipe2: IPipeFitting = new Pipe(
      new PipeListener((m) => messagesReceived.push(m)),
    );
    const pipe3: IPipeFitting = new Pipe(
      new PipeListener((m) => messagesReceived.push(m)),
    );
    const pipe4: IPipeFitting = new Pipe(
      new PipeListener((m) => messagesReceived.push(m)),
    );

    const teeSplit: TeeSplit = new TeeSplit(pipe1, pipe2);
    teeSplit.connect(pipe3);
    teeSplit.connect(pipe4);

    // remove 2 and 4 specifically
    const removed2 = teeSplit.disconnectFitting(pipe2);
    const removed4 = teeSplit.disconnectFitting(pipe4);

    // removing again should return undefined
    const removed2again = teeSplit.disconnectFitting(pipe2);
    const removed4again = teeSplit.disconnectFitting(pipe4);

    expect(removed2).toBe(pipe2);
    expect(removed4).toBe(pipe4);
    expect(removed2again).toBeUndefined();
    expect(removed4again).toBeUndefined();

    // connect input
    const inputConnected = input1.connect(teeSplit);
    expect(inputConnected).toBe(true);

    // write message and ensure only 2 outputs receive (pipe1 and pipe3)
    const message: IPipeMessage = { type: PipeMessageType.NORMAL };
    const written = input1.write(message);
    expect(written).toBe(true);
    expect(messagesReceived.length).toBe(2);
  });

  test("Receive messages from two TeeSplit outputs", () => {
    const messagesReceived1: IPipeMessage[] = [];
    const messagesReceived2: IPipeMessage[] = [];

    const input: IPipeFitting = new Pipe();
    const out1: IPipeFitting = new Pipe(
      new PipeListener((m) => messagesReceived1.push(m)),
    );
    const out2: IPipeFitting = new Pipe(
      new PipeListener((m) => messagesReceived2.push(m)),
    );

    const teeSplit: TeeSplit = new TeeSplit(out1, out2);

    const inputConnected = input.connect(teeSplit);
    expect(inputConnected).toBe(true);

    const message: IPipeMessage = {
      type: PipeMessageType.NORMAL,
      header: { testProp: 1 },
      body: { testAtt: "Hello" },
    };

    const written = input.write(message);
    expect(written).toBe(true);
    expect(messagesReceived1.length).toBe(1);
    expect(messagesReceived2.length).toBe(1);
    expect(messagesReceived1[0]).toBe(message);
    expect(messagesReceived2[0]).toBe(message);
  });

  test("Constructor allows zero outputs; can connect later", () => {
    const messagesReceived1: IPipeMessage[] = [];
    const messagesReceived2: IPipeMessage[] = [];

    const input: IPipeFitting = new Pipe();
    const out1: IPipeFitting = new Pipe(
      new PipeListener((m) => messagesReceived1.push(m)),
    );
    const out2: IPipeFitting = new Pipe(
      new PipeListener((m) => messagesReceived2.push(m)),
    );

    // Create TeeSplit with no constructor args
    const teeSplit: TeeSplit = new TeeSplit();

    // Connect outputs after construction
    expect(teeSplit.connect(out1)).toBe(true);
    expect(teeSplit.connect(out2)).toBe(true);

    // Connect input
    expect(input.connect(teeSplit)).toBe(true);

    // Fan-out works as expected
    const message: IPipeMessage = {
      type: PipeMessageType.NORMAL,
      header: { testProp: 2 },
      body: { testAtt: "World" },
    };
    expect(input.write(message)).toBe(true);
    expect(messagesReceived1.length).toBe(1);
    expect(messagesReceived2.length).toBe(1);
    expect(messagesReceived1[0]).toBe(message);
    expect(messagesReceived2[0]).toBe(message);
  });

  test("Constructor allows a single optional output", () => {
    const messagesReceived1: IPipeMessage[] = [];

    const input: IPipeFitting = new Pipe();
    const out1: IPipeFitting = new Pipe(
      new PipeListener((m) => messagesReceived1.push(m)),
    );

    // Create TeeSplit with a single optional output
    const teeSplit: TeeSplit = new TeeSplit(out1);

    // Connect input
    expect(input.connect(teeSplit)).toBe(true);

    // Only the provided output should receive
    const message: IPipeMessage = { type: PipeMessageType.NORMAL };
    expect(input.write(message)).toBe(true);
    expect(messagesReceived1.length).toBe(1);
    expect(messagesReceived1[0]).toBe(message);
  });
});
