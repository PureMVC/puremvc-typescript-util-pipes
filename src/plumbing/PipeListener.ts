import { IPipeFitting, IPipeMessage, PipeListenerCallback } from "../index";

/**
 * Pipe Listener.
 *
 * Allows a class that does not implement `IPipeFitting` to
 * be the final recipient of the messages in a pipeline.
 *
 * @see Junction
 */
export class PipeListener implements IPipeFitting {
  protected callback: PipeListenerCallback;

  constructor(callback: PipeListenerCallback) {
    this.callback = callback;
  }

  /**
   * Can't connect anything beyond this.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public connect(output: IPipeFitting): boolean {
    return false;
  }

  /**
   * Can't disconnect anything, either.
   */
  public disconnect(): IPipeFitting | undefined {
    return undefined;
  }

  /**
   * Write the message to the listener.
   * @param message
   */
  public write(message: IPipeMessage): boolean {
    let success = false;
    if (this.callback !== undefined) {
      this.callback(message);
      success = true;
    }
    return success;
  }
}
