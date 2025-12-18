import { IPipeMessage } from "../types/message";
import { PipeMessageType } from "../types/enum";

/**
 * Test the Message shape (IPipeMessage).
 */
describe("Message Test", () => {
  test("Constructor shape and property access", () => {
    // create a message with complete fields
    const message: IPipeMessage = {
      type: PipeMessageType.NORMAL,
      header: { testProp: "testval" },
      body: { testAtt: "Hello" },
      priority: 1,
    };

    // assertions
    expect(message.type).toBe(PipeMessageType.NORMAL);
    expect((message.header as { testProp: string }).testProp).toBe("testval");
    expect((message.body as { testAtt: string }).testAtt).toBe("Hello");
    expect(message.priority).toBe(1);
  });

  test("Default (omitted) priority is undefined", () => {
    // Create a message with minimum fields
    const message: IPipeMessage = { type: PipeMessageType.NORMAL };

    // priority should be undefined unless set
    expect(message.priority).toBeUndefined();
  });

  test("Mutating fields behaves like setters/getters", () => {
    // create a minimal message
    const message: IPipeMessage = { type: PipeMessageType.NORMAL };

    // mutate remaining fields (analogous to setters)
    message.header = { testProp: "testval" };
    message.body = { testAtt: "Hello" };
    message.priority = 3;

    // assertions
    expect(message.type).toBe(PipeMessageType.NORMAL);
    expect((message.header as { testProp: string }).testProp).toBe("testval");
    expect((message.body as { testAtt: string }).testAtt).toBe("Hello");
    expect(message.priority).toBe(3);
  });
});
