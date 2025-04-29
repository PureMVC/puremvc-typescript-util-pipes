/**
 * Pipe Listener.
 *
 * Allows a class that does not implement `IPipeFitting` to
 * be the final recipient of the messages in a pipeline.
 *
 * @see Junction
 */
export class PipeListener {
    constructor(callback) {
        this.callback = callback;
    }
    /**
     * Can't connect anything beyond this.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    connect(output) {
        return false;
    }
    /**
     * Can't disconnect anything, either.
     */
    disconnect() {
        return undefined;
    }
    /**
     * Write the message to the listener.
     * @param message
     */
    write(message) {
        let success = false;
        if (this.callback !== undefined) {
            this.callback(message);
            success = true;
        }
        return success;
    }
}
