import { Pipe } from "./Pipe";
/**
 * Merging Pipe Tee.
 *
 * Writes the messages from multiple input pipelines into
 * a single output pipe fitting.
 */
export class TeeMerge extends Pipe {
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
    constructor(input1, input2) {
        super(null);
        if (input1)
            this.connectInput(input1);
        if (input2)
            this.connectInput(input2);
    }
    /**
     * Connect an input IPipeFitting.
     *
     * NOTE: You can connect as many inputs as you want
     * by calling this method repeatedly.
     *
     * @param input the IPipeFitting to connect for input.
     */
    connectInput(input) {
        return input.connect(this);
    }
}
