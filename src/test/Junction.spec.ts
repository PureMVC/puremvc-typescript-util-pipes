import { Pipe, PipeListener, Junction } from "../plumbing";
import {
  IPipeFitting,
  IPipeMessage,
  PipeMessageType,
  JunctionType,
} from "../index";

describe("Junction Test", () => {
  test("Register, retrieve and remove INPUT pipe", () => {
    const pipe: IPipeFitting = new Pipe();
    const junction = new Junction();

    const registered = junction.registerPipe({
      name: "testInputPipe",
      type: JunctionType.INPUT,
      pipe,
    });

    expect(pipe).toBeInstanceOf(Pipe);
    expect(junction).toBeInstanceOf(Junction);
    expect(registered).toBe(true);

    expect(junction.hasPipe("testInputPipe")).toBe(true);
    expect(junction.hasInputPipe("testInputPipe")).toBe(true);
    expect(junction.retrievePipe("testInputPipe")).toBe(pipe);

    junction.removePipe("testInputPipe");
    expect(junction.hasPipe("testInputPipe")).toBe(false);
    expect(junction.hasInputPipe("testInputPipe")).toBe(false);
    expect(junction.retrievePipe("testInputPipe")).toBeUndefined();
  });

  test("Register, retrieve and remove OUTPUT pipe", () => {
    const pipe: IPipeFitting = new Pipe();
    const junction = new Junction();

    const registered = junction.registerPipe({
      name: "testOutputPipe",
      type: JunctionType.OUTPUT,
      pipe,
    });

    expect(pipe).toBeInstanceOf(Pipe);
    expect(junction).toBeInstanceOf(Junction);
    expect(registered).toBe(true);

    expect(junction.hasPipe("testOutputPipe")).toBe(true);
    expect(junction.hasOutputPipe("testOutputPipe")).toBe(true);
    expect(junction.retrievePipe("testOutputPipe")).toBe(pipe);

    junction.removePipe("testOutputPipe");
    expect(junction.hasPipe("testOutputPipe")).toBe(false);
    expect(junction.hasOutputPipe("testOutputPipe")).toBe(false);
    expect(junction.retrievePipe("testOutputPipe")).toBeUndefined();
  });

  test("Add PipeListener to INPUT pipe and receive message", () => {
    const pipe: IPipeFitting = new Pipe();
    const junction = new Junction();
    const messagesReceived: IPipeMessage[] = [];
    const message: IPipeMessage = {
      type: PipeMessageType.NORMAL,
      header: { testVal: 1 },
    };

    const registered = junction.registerPipe({
      name: "testInputPipe",
      type: JunctionType.INPUT,
      pipe,
    });

    const listenerAdded = junction.addPipeListener("testInputPipe", (m) => {
      messagesReceived.push(m);
    });

    const sent = pipe.write(message);

    expect(pipe).toBeInstanceOf(Pipe);
    expect(junction).toBeInstanceOf(Junction);
    expect(registered).toBe(true);
    expect(listenerAdded).toBe(true);
    expect(sent).toBe(true);
    expect(messagesReceived.length).toBe(1);
    expect(messagesReceived.pop()).toBe(message);
  });

  test("Send message on OUTPUT pipe via Junction", () => {
    const pipe: IPipeFitting = new Pipe();
    const messagesReceived: IPipeMessage[] = [];
    const listenerAdded = pipe.connect(
      new PipeListener((m) => messagesReceived.push(m)),
    );

    const junction = new Junction();
    const message: IPipeMessage = {
      type: PipeMessageType.NORMAL,
      header: { testVal: 1 },
    };

    const registered = junction.registerPipe({
      name: "testOutputPipe",
      type: JunctionType.OUTPUT,
      pipe,
    });

    const sent = junction.sendMessage("testOutputPipe", message);

    expect(pipe).toBeInstanceOf(Pipe);
    expect(junction).toBeInstanceOf(Junction);
    expect(registered).toBe(true);
    expect(listenerAdded).toBe(true);
    expect(sent).toBe(true);
    expect(messagesReceived.length).toBe(1);
    expect(messagesReceived.pop()).toBe(message);
  });
});
