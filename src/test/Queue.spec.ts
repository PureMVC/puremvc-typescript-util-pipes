import { Pipe, Queue, PipeListener } from "../plumbing/index.js";
import {
  IPipeFitting,
  IPipeMessage,
  PipeMessageType,
  QueueControlMessageType,
} from "../index.js";

describe("Queue Test", () => {
  test("Connect input and output pipes to a Queue", () => {
    const pipe1: IPipeFitting = new Pipe();
    const pipe2: IPipeFitting = new Pipe();
    const queue: Queue = new Queue();

    const connectedInput = pipe1.connect(queue);
    const connectedOutput = queue.connect(pipe2);

    expect(pipe1).toBeInstanceOf(Pipe);
    expect(pipe2).toBeInstanceOf(Pipe);
    expect(queue).toBeInstanceOf(Queue);
    expect(connectedInput).toBe(true);
    expect(connectedOutput).toBe(true);
  });

  test("Write multiple messages then FLUSH (FIFO)", () => {
    const messagesReceived: IPipeMessage[] = [];

    const message1: IPipeMessage = {
      type: PipeMessageType.NORMAL,
      header: { testProp: 1 },
    };
    const message2: IPipeMessage = {
      type: PipeMessageType.NORMAL,
      header: { testProp: 2 },
    };
    const message3: IPipeMessage = {
      type: PipeMessageType.NORMAL,
      header: { testProp: 3 },
    };

    const flush: IPipeMessage = { type: QueueControlMessageType.FLUSH };

    const queue: Queue = new Queue(
      new PipeListener((m) => messagesReceived.push(m)),
    );

    const message1written = queue.write(message1);
    const message2written = queue.write(message2);
    const message3written = queue.write(message3);

    expect(message1written).toBe(true);
    expect(message2written).toBe(true);
    expect(message3written).toBe(true);

    // nothing received yet (enqueued)
    expect(messagesReceived.length).toBe(0);

    const flushWritten = queue.write(flush);
    expect(flushWritten).toBe(true);

    // all 3 received FIFO and identity preserved
    expect(messagesReceived.length).toBe(3);
    const received1 = messagesReceived.shift() as IPipeMessage;
    const received2 = messagesReceived.shift() as IPipeMessage;
    const received3 = messagesReceived.shift() as IPipeMessage;
    expect(received1).toBe(message1);
    expect(received2).toBe(message2);
    expect(received3).toBe(message3);
  });

  test("SORT by priority then FIFO switch", () => {
    const messagesReceived: IPipeMessage[] = [];

    const message1: IPipeMessage = {
      type: PipeMessageType.NORMAL,
      priority: 2, // MEDIUM
    };
    const message2: IPipeMessage = {
      type: PipeMessageType.NORMAL,
      priority: 3, // LOW
    };
    const message3: IPipeMessage = {
      type: PipeMessageType.NORMAL,
      priority: 1, // HIGH
    };

    const queue: Queue = new Queue(
      new PipeListener((m) => messagesReceived.push(m)),
    );

    // begin sort-by-priority mode
    const sortWritten = queue.write({ type: QueueControlMessageType.SORT });

    // write messages and flush
    const w1 = queue.write(message1);
    const w2 = queue.write(message2);
    const w3 = queue.write(message3);
    const flushWritten = queue.write({ type: QueueControlMessageType.FLUSH });

    expect(sortWritten).toBe(true);
    expect(w1 && w2 && w3 && flushWritten).toBe(true);
    expect(messagesReceived.length).toBe(3);

    const r1 = messagesReceived.shift() as IPipeMessage;
    const r2 = messagesReceived.shift() as IPipeMessage;
    const r3 = messagesReceived.shift() as IPipeMessage;

    // ascending numeric priority: 1 (HIGH), 2 (MED), 3 (LOW)
    expect((r1.priority as number) < (r2.priority as number)).toBe(true);
    expect((r2.priority as number) < (r3.priority as number)).toBe(true);
    expect(r1).toBe(message3);
    expect(r2).toBe(message1);
    expect(r3).toBe(message2);

    // switch back to FIFO
    const fifoWritten = queue.write({ type: QueueControlMessageType.FIFO });
    const w1b = queue.write(message1);
    const w2b = queue.write(message2);
    const w3b = queue.write(message3);
    const flushWrittenB = queue.write({ type: QueueControlMessageType.FLUSH });

    expect(fifoWritten && w1b && w2b && w3b && flushWrittenB).toBe(true);
    expect(messagesReceived.length).toBe(3);
    const rb1 = messagesReceived.shift() as IPipeMessage;
    const rb2 = messagesReceived.shift() as IPipeMessage;
    const rb3 = messagesReceived.shift() as IPipeMessage;
    expect(rb1).toBe(message1);
    expect(rb2).toBe(message2);
    expect(rb3).toBe(message3);
  });
});
