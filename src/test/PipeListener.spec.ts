import { Pipe, PipeListener } from "../plumbing/index.js";
import { IPipeFitting, IPipeMessage, PipeMessageType } from "../index.js";

/**
 * Test the PipeListener class.
 */
describe("PipeListener Test", () => {
  test("PipeListener.connect returns false and disconnect returns undefined", () => {
    const listener: PipeListener = new PipeListener(() => void 0);
    const connected = listener.connect(new Pipe());
    expect(connected).toBe(false);
    expect(listener.disconnect()).toBeUndefined();
  });

  test("Connect a PipeListener to a Pipe", () => {
    // create pipe and listener
    const pipe: IPipeFitting = new Pipe();
    const listener: PipeListener = new PipeListener(() => void 0);

    // connect the listener to the pipe
    const success: boolean = pipe.connect(listener);

    // test assertions
    expect(pipe).toBeInstanceOf(Pipe);
    expect(success).toBe(true);
  });

  test("Receive a message via PipeListener", () => {
    let messageReceived: IPipeMessage | undefined;

    // create a message
    const messageToSend: IPipeMessage = {
      type: PipeMessageType.NORMAL,
      header: { testProp: "testval" },
      body: { testAtt: "Hello" },
      priority: 0,
    };

    // create pipe and listener
    const pipe: IPipeFitting = new Pipe();
    const listener: PipeListener = new PipeListener((msg) => {
      messageReceived = msg;
    });

    // connect the listener to the pipe and write the message
    const connected: boolean = pipe.connect(listener);
    const written: boolean = pipe.write(messageToSend);

    // test assertions
    expect(pipe).toBeInstanceOf(Pipe);
    expect(connected).toBe(true);
    expect(written).toBe(true);
    expect(messageReceived).toBeDefined();
    expect((messageReceived as IPipeMessage).type).toBe(PipeMessageType.NORMAL);
    expect(
      ((messageReceived as IPipeMessage).header as { testProp: string })
        .testProp,
    ).toBe("testval");
    expect(
      ((messageReceived as IPipeMessage).body as { testAtt: string }).testAtt,
    ).toBe("Hello");
    expect((messageReceived as IPipeMessage).priority).toBe(0);
  });

  test("Write returns false when callback is undefined", () => {
    // Create a listener and forcibly unset its protected callback via a structural cast
    const listener = new PipeListener(() => void 0);
    const testable = listener as unknown as {
      callback?: ((m: IPipeMessage) => void) | undefined;
    };
    testable.callback = undefined;

    const success = (listener as PipeListener).write({
      type: PipeMessageType.NORMAL,
    });
    expect(success).toBe(false);
  });
});
