import { Pipe } from "../plumbing";
import { IPipeFitting } from "../index";

/**
 * Test the Pipe class.
 */
describe("Pipe Test", () => {
  test("Should implement IPipeFitting and be constructed with no arguments", () => {
    // create a pipe, casting to IPipeFitting
    const pipe: IPipeFitting = new Pipe();

    // instance created
    expect(pipe).toBeInstanceOf(Pipe);
  });

  test("Should connect two pipes", () => {
    // create two pipes
    const pipe1: IPipeFitting = new Pipe();
    const pipe2: IPipeFitting = new Pipe();

    // connect pipe 2 to pipe 1
    const connected: boolean = pipe1.connect(pipe2);

    // they should be connected
    expect(connected).toBe(true);
  });

  test("Should disconnect two connected pipes", () => {
    // create two pipes
    const pipe1: IPipeFitting = new Pipe();
    const pipe2: IPipeFitting = new Pipe();

    // connect pipe 2 to pipe 1
    const connected: boolean = pipe1.connect(pipe2);

    // they should be connected
    expect(connected).toBe(true);

    // disconnect pipe 2 from pipe 1
    const disconnectedPipe: IPipeFitting = pipe1.disconnect() as Pipe;
    expect(disconnectedPipe).toBe(pipe2);

    // nothing remains connected to pipe 1
    const noOutput: IPipeFitting = pipe1.disconnect() as Pipe;
    expect(noOutput).toBe(undefined);
  });

  test("Pipe can be constructed with another pipe as its output", () => {
    // create a pipe
    const pipe1: IPipeFitting = new Pipe();

    // create second pipe with first pipe as it's output
    const pipe2: IPipeFitting = new Pipe(pipe1);

    // disconnect pipe 1 from pipe 2
    const disconnectedPipe: IPipeFitting = pipe2.disconnect() as Pipe;
    expect(disconnectedPipe).toBe(pipe1);
  });

  test("Should fail to connect a pipe to a pipe with an output already connected", () => {
    // create three pipes
    const pipe1: IPipeFitting = new Pipe();
    const pipe2: IPipeFitting = new Pipe();
    const pipe3: IPipeFitting = new Pipe();

    // connect pipe 2 to pipe 1
    const connected: boolean = pipe1.connect(pipe2);

    // they should be connected
    expect(connected).toBe(true);

    // attempt to connect pipe 3 to pipe 1
    const extraConnected: boolean = pipe1.connect(pipe3);

    // new pipe should not be connected
    expect(extraConnected).toBe(false);
  });
});
