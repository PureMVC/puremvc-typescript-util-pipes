import { IPipeFitting, IPipeMessage } from "../index";

/**
 * Splitting Pipe Tee.
 *
 * Writes input messages to multiple output pipe fittings.
 */
export class TeeSplit implements IPipeFitting {
  protected outputs: Array<IPipeFitting> = new Array<IPipeFitting>();

  /**
   * Constructor.
   *
   * Create the TeeSplit and connect the up two optional outputs.
   * This is the most common configuration, though you can connect
   * as many outputs as necessary by calling `connect`.
   */
  constructor(output1: IPipeFitting, output2: IPipeFitting) {
    if (output1) this.connect(output1);
    if (output2) this.connect(output2);
  }

  /**
   * Connect the output IPipeFitting.
   *
   * NOTE: You can connect as many outputs as you want
   * by calling this method repeatedly.
   *
   * @param output the IPipeFitting to connect for output.
   */
  public connect(output: IPipeFitting): boolean {
    this.outputs.push(output);
    return true;
  }

  /**
   * Disconnect the most recently connected output fitting. (LIFO)
   *
   * To disconnect all outputs, you must call this
   * method repeatedly until it returns null.
   */
  public disconnect(): IPipeFitting {
    return this.outputs.pop() as IPipeFitting;
  }

  /**
   * Disconnect a given output fitting.
   *
   * If the fitting passed in is connected
   * as an output of this `TeeSplit`, then
   * it is disconnected and the reference returned.
   *
   * If the fitting passed in is not connected as an
   * output of this `TeeSplit`, then `null`
   * is returned.
   *
   * @param target the IPipeFitting to connect for output.
   */
  public disconnectFitting(target: IPipeFitting): IPipeFitting | undefined {
    let removed: IPipeFitting | undefined = undefined;
    for (let i: number = 0; i < this.outputs.length; i++) {
      let output: IPipeFitting = this.outputs[i];
      if (output === target) {
        this.outputs.splice(i, 1);
        removed = output;
        break;
      }
    }
    return removed;
  }

  /**
   * Write the message to all connected outputs.
   *
   * Returns false if any output returns false,
   * but all outputs are written to regardless.
   * @param message the message to write
   * @return boolean whether any connected outputs failed
   */
  public write(message: IPipeMessage): boolean {
    let success: boolean = true;
    for (let i: number = 0; i < this.outputs.length; i++) {
      let output: IPipeFitting = this.outputs[i];
      if (!output.write(message)) success = false;
    }
    return success;
  }
}
