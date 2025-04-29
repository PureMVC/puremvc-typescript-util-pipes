import { IPipeFitting, IPipeMessage } from "../types";
/**
 * Splitting Pipe Tee.
 *
 * Writes input messages to multiple output pipe fittings.
 */
export declare class TeeSplit implements IPipeFitting {
    protected outputs: Array<IPipeFitting>;
    /**
     * Constructor.
     *
     * Create the TeeSplit and connect the up two optional outputs.
     * This is the most common configuration, though you can connect
     * as many outputs as necessary by calling `connect`.
     */
    constructor(output1: IPipeFitting, output2: IPipeFitting);
    /**
     * Connect the output IPipeFitting.
     *
     * NOTE: You can connect as many outputs as you want
     * by calling this method repeatedly.
     *
     * @param output the IPipeFitting to connect for output.
     */
    connect(output: IPipeFitting): boolean;
    /**
     * Disconnect the most recently connected output fitting. (LIFO)
     *
     * To disconnect all outputs, you must call this
     * method repeatedly until it returns null.
     */
    disconnect(): IPipeFitting;
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
    disconnectFitting(target: IPipeFitting): IPipeFitting | undefined;
    /**
     * Write the message to all connected outputs.
     *
     * Returns false if any output returns false,
     * but all outputs are written to regardless.
     * @param message the message to write
     * @return boolean whether any connected outputs failed
     */
    write(message: IPipeMessage): boolean;
}
