import { Pipe, TeeMerge, PipeListener } from "../plumbing/index.js";
import { IPipeFitting, IPipeMessage, PipeMessageType } from "../index.js";

describe("TeeMerge Test", () => {
  test("Construct TeeMerge with no constructor args and add inputs later", () => {
    const messagesReceived: IPipeMessage[] = [];

    const input1: IPipeFitting = new Pipe();
    const input2: IPipeFitting = new Pipe();
    const teeMerge: TeeMerge = new TeeMerge();

    const connectedInput1 = teeMerge.connectInput(input1);
    const connectedInput2 = teeMerge.connectInput(input2);

    const connectedOutput = teeMerge.connect(
      new PipeListener((m) => messagesReceived.push(m)),
    );

    const msg1: IPipeMessage = {
      type: PipeMessageType.NORMAL,
      header: { src: 1 },
    };
    const msg2: IPipeMessage = {
      type: PipeMessageType.NORMAL,
      header: { src: 2 },
    };

    const w1 = input1.write(msg1);
    const w2 = input2.write(msg2);

    expect(teeMerge).toBeInstanceOf(TeeMerge);
    expect(connectedInput1).toBe(true);
    expect(connectedInput2).toBe(true);
    expect(connectedOutput).toBe(true);
    expect(w1 && w2).toBe(true);

    expect(messagesReceived.length).toBe(2);
    const r1 = messagesReceived.shift() as IPipeMessage;
    const r2 = messagesReceived.shift() as IPipeMessage;
    expect(r1).toBe(msg1);
    expect(r2).toBe(msg2);
  });

  test("Connect inputs and an output to TeeMerge", () => {
    const output1: IPipeFitting = new Pipe();
    const pipe1: IPipeFitting = new Pipe();
    const pipe2: IPipeFitting = new Pipe();
    const pipe3: IPipeFitting = new Pipe();
    const pipe4: IPipeFitting = new Pipe();

    const teeMerge: TeeMerge = new TeeMerge(pipe1, pipe2);

    const connectedExtra1 = teeMerge.connectInput(pipe3);
    const connectedExtra2 = teeMerge.connectInput(pipe4);

    // connect the single output by placing teeMerge as output of output1
    const connected = output1.connect(teeMerge);

    expect(pipe1).toBeInstanceOf(Pipe);
    expect(pipe2).toBeInstanceOf(Pipe);
    expect(pipe3).toBeInstanceOf(Pipe);
    expect(pipe4).toBeInstanceOf(Pipe);
    expect(teeMerge).toBeInstanceOf(TeeMerge);
    expect(connectedExtra1).toBe(true);
    expect(connectedExtra2).toBe(true);
    expect(connected).toBe(true);
  });

  test("Receive messages from two pipes via TeeMerge", () => {
    const messagesReceived: IPipeMessage[] = [];

    const pipe1Message: IPipeMessage = {
      type: PipeMessageType.NORMAL,
      header: { testProp: 1 },
      body: { testAtt: "Pipe 1 Message" },
      priority: 3, // LOW
    };
    const pipe2Message: IPipeMessage = {
      type: PipeMessageType.NORMAL,
      header: { testProp: 2 },
      body: { testAtt: "Pipe 2 Message" },
      priority: 1, // HIGH
    };

    const pipe1: IPipeFitting = new Pipe();
    const pipe2: IPipeFitting = new Pipe();

    const teeMerge: TeeMerge = new TeeMerge(pipe1, pipe2);
    const connected = teeMerge.connect(
      new PipeListener((m) => messagesReceived.push(m)),
    );

    const pipe1written = pipe1.write(pipe1Message);
    const pipe2written = pipe2.write(pipe2Message);

    expect(connected).toBe(true);
    expect(pipe1written).toBe(true);
    expect(pipe2written).toBe(true);

    expect(messagesReceived.length).toBe(2);
    const message1 = messagesReceived.shift() as IPipeMessage;
    const message2 = messagesReceived.shift() as IPipeMessage;

    expect(message1).toBe(pipe1Message);
    expect(message1.type).toBe(PipeMessageType.NORMAL);
    expect((message1.header as { testProp: number }).testProp).toBe(1);
    expect((message1.body as { testAtt: string }).testAtt).toBe(
      "Pipe 1 Message",
    );
    expect(message1.priority).toBe(3);

    expect(message2).toBe(pipe2Message);
    expect(message2.type).toBe(PipeMessageType.NORMAL);
    expect((message2.header as { testProp: number }).testProp).toBe(2);
    expect((message2.body as { testAtt: string }).testAtt).toBe(
      "Pipe 2 Message",
    );
    expect(message2.priority).toBe(1);
  });

  test("Receive messages from four pipes via TeeMerge", () => {
    const messagesReceived: IPipeMessage[] = [];

    const pipe1Message: IPipeMessage = {
      type: PipeMessageType.NORMAL,
      header: { testProp: 1 },
    };
    const pipe2Message: IPipeMessage = {
      type: PipeMessageType.NORMAL,
      header: { testProp: 2 },
    };
    const pipe3Message: IPipeMessage = {
      type: PipeMessageType.NORMAL,
      header: { testProp: 3 },
    };
    const pipe4Message: IPipeMessage = {
      type: PipeMessageType.NORMAL,
      header: { testProp: 4 },
    };

    const pipe1: IPipeFitting = new Pipe();
    const pipe2: IPipeFitting = new Pipe();
    const pipe3: IPipeFitting = new Pipe();
    const pipe4: IPipeFitting = new Pipe();

    const teeMerge: TeeMerge = new TeeMerge(pipe1, pipe2);
    const connectedExtraInput3 = teeMerge.connectInput(pipe3);
    const connectedExtraInput4 = teeMerge.connectInput(pipe4);

    const connected = teeMerge.connect(
      new PipeListener((m) => messagesReceived.push(m)),
    );

    const w1 = pipe1.write(pipe1Message);
    const w2 = pipe2.write(pipe2Message);
    const w3 = pipe3.write(pipe3Message);
    const w4 = pipe4.write(pipe4Message);

    expect(connected).toBe(true);
    expect(connectedExtraInput3).toBe(true);
    expect(connectedExtraInput4).toBe(true);
    expect(w1 && w2 && w3 && w4).toBe(true);

    expect(messagesReceived.length).toBe(4);
    const m1 = messagesReceived.shift() as IPipeMessage;
    const m2 = messagesReceived.shift() as IPipeMessage;
    const m3 = messagesReceived.shift() as IPipeMessage;
    const m4 = messagesReceived.shift() as IPipeMessage;

    expect(m1).toBe(pipe1Message);
    expect(m2).toBe(pipe2Message);
    expect(m3).toBe(pipe3Message);
    expect(m4).toBe(pipe4Message);
    expect((m1.header as { testProp: number }).testProp).toBe(1);
    expect((m2.header as { testProp: number }).testProp).toBe(2);
    expect((m3.header as { testProp: number }).testProp).toBe(3);
    expect((m4.header as { testProp: number }).testProp).toBe(4);
  });
});
