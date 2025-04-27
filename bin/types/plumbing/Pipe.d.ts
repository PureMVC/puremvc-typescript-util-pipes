import { IPipeFitting, IPipeMessage } from "../index";
/**
 * Pipe.
 *
 * This is the most basic `IPipeFitting`,
 * simply allowing the connection of an output
 * fitting and writing of a message to that output.
 */
export declare class Pipe implements IPipeFitting {
    protected output: IPipeFitting | null;
    constructor(output: IPipeFitting | null);
    /**
     * Connect another PipeFitting to the output.
     *
     * PipeFittings connect to and write to other
     * PipeFittings in a one-way, synchronous chain.
     *
     * @return boolean true if no other fitting was already connected.
     */
    connect(output: IPipeFitting): boolean;
    /**
     * Disconnect the Pipe Fitting connected to the output.
     *
     * This disconnects the output fitting, returning a
     * reference to it. If you were splicing another fitting
     * into a pipeline, you need to keep (at least briefly)
     * a reference to both sides of the pipeline in order to
     * connect them to the input and output of whatever
     * fitting that you're splicing in.
     *
     * @return IPipeFitting the now disconnected output fitting
     */
    disconnect(): IPipeFitting | null;
    /**
     * Write the message to the connected output.
     *
     * @param message the message to write
     * @return boolean whether any connected down-pipe outputs failed
     */
    write(message: IPipeMessage): boolean;
}
