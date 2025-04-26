import { PipeMessage } from "./message";

/**
 * Pipe Fitting Interface.
 *
 * An `IPipeFitting<` can be connected to other
 * `IPipeFitting`s, forming a Pipeline.
 * `Messages`s are written to one end of a
 * Pipeline by some client code. The messages are then
 * transferred in synchronous fashion from one fitting to
 * the next.
 */
export interface IPipeFitting {
  /**
   * Connect another Pipe Fitting to the output.
   *`
   * Fittings connect and write to
   * other fittings in a one way synchronous
   * chain, as water typically flows one direction
   * through a physical pipes.ts.`
   *
   * @return boolean true if no other fitting was already connected.
   */
  connect(output: IPipeFitting): boolean;

  /**
   * Disconnect the Pipe Fitting connected to the output.
   *`
   * This disconnects the output fitting, returning a
   * reference to it. If you were splicing another fitting
   * into a pipeline, you need to keep (at least briefly)
   * a reference to both sides of the pipeline in order to
   * connect them to the input and output of whatever
   * fitting that you're splicing in.`
   *
   * @return IPipeFitting the now disconnected output fitting
   */
  disconnect(): IPipeFitting | null;

  /**
   * Write the message to the output Pipe Fitting.
   *`
   * There may be subsequent filters and tees
   * (which also implement this interface), that the
   * fitting is writing to, and so a message
   * may branch and arrive in different forms at
   * different endpoints. `
   *`
   * If any fitting in the chain returns false
   * from this method, then the client who originally
   * wrote into the pipes.ts can take action, such as
   * rolling back changes.`
   */
  write(message: PipeMessage): boolean;
}

/**
 * Pipe Aware interface.
 *
 * Can be implemented by any PureMVC Core that wishes
 * to communicate with other Cores using the Pipes
 * utility.
 */
export interface IPipeAware {
  acceptInputPipe(name: string, pipe: IPipeFitting): void;
  acceptOutputPipe(name: string, pipe: IPipeFitting): void;
}

export type PipeListenerCallback = (message: PipeMessage) => void;

export type FilterControlFunction = (message: PipeMessage) => boolean;

/**
 * Accept input pipe notification name constant.
 */
export const ACCEPT_INPUT_PIPE: string = "acceptInputPipe";

/**
 * Accept output pipe notification name constant.
 */
export const ACCEPT_OUTPUT_PIPE: string = "acceptOutputPipe";
