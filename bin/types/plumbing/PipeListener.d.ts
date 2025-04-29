import { IPipeFitting, IPipeMessage, PipeListenerCallback } from "../types";
/**
 * Pipe Listener.
 *
 * Allows a class that does not implement `IPipeFitting` to
 * be the final recipient of the messages in a pipeline.
 *
 * @see Junction
 */
export declare class PipeListener implements IPipeFitting {
    protected callback: PipeListenerCallback;
    constructor(callback: PipeListenerCallback);
    /**
     * Can't connect anything beyond this.
     */
    connect(output: IPipeFitting): boolean;
    /**
     * Can't disconnect anything, either.
     */
    disconnect(): IPipeFitting | undefined;
    /**
     * Write the message to the listener.
     * @param message
     */
    write(message: IPipeMessage): boolean;
}
