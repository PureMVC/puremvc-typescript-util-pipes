import { Pipe, IPipeFitting } from "../types";
/**
 * Merging Pipe Tee.
 *
 * Writes the messages from multiple input pipelines into
 * a single output pipe fitting.
 */
export declare class TeeMerge extends Pipe {
    /**
     * Constructor.
     *
     * Create the TeeMerge and the two optional constructor inputs.
     * This is the most common configuration, though you can connect
     * as many inputs as necessary by calling `connectInput`
     * repeatedly.
     *
     * Connect the single output fitting normally by calling the
     * `connect` method, as you would with any other IPipeFitting.
     */
    constructor(input1: IPipeFitting, input2: IPipeFitting);
    /**
     * Connect an input IPipeFitting.
     *
     * NOTE: You can connect as many inputs as you want
     * by calling this method repeatedly.
     *
     * @param input the IPipeFitting to connect for input.
     */
    connectInput(input: IPipeFitting): boolean;
}
