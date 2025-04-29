"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
const types_1 = require("../types");
/**
 * Pipe Queue.
 *
 * The Queue always stores inbound messages until you send it
 * a FLUSH control message, at which point it writes its buffer
 * to the output pipe fitting. The Queue can be sent a SORT
 * control message to go into sort-by-priority mode or a FIFO
 * control message to cancel sort mode and return the
 * default mode of operation, FIFO.
 *
 *
 * NOTE: There can effectively be only one Queue on a given
 * pipeline, since the first Queue acts on any queue control
 * message. Multiple queues in one pipeline are of dubious
 * use, and so having to name them would make their operation
 * more complex than need be.
 */
class Queue extends types_1.Pipe {
    constructor(output) {
        super(output);
        this.mode = types_1.QueueControlMessageType.SORT;
        this.messages = new Array();
    }
    /**
     * Handle the incoming message.
     *
     * Normal messages are enqueued.
     *
     * The FLUSH message type tells the Queue to write all
     * stored messages to the output PipeFitting, then
     * return to normal enqueuing operation.
     *
     * The SORT message type tells the Queue to sort all
     * subsequent incoming messages by priority. If there
     * are un-flushed messages in the queue, they will not be
     * sorted unless a new message is sent before the next FLUSH.
     * Sorting-by-priority behavior continues even after a FLUSH,
     * and can be turned off by sending a FIFO message, which is
     * the default behavior for enqueue/dequeue.
     */
    write(message) {
        let success = true;
        switch (message.type) {
            // Store normal messages
            case types_1.PipeMessageType.NORMAL:
                this.store(message);
                break;
            // Flush the queue
            case types_1.QueueControlMessageType.FLUSH:
                success = this.flush();
                break;
            // Put Queue into Priority Sort or FIFO mode
            // Subsequent messages written to the queue
            // will be affected. Sorted messages cannot
            // be put back into FIFO order!
            case types_1.QueueControlMessageType.SORT:
            case types_1.QueueControlMessageType.FIFO:
                this.mode = message.type;
                break;
        }
        return success;
    }
    /**
     * Store a message.
     * @param message the PipeMessage to enqueue.
     * @return number the new count of messages in the queue
     */
    store(message) {
        this.messages.push(message);
        if (this.mode === types_1.QueueControlMessageType.SORT)
            this.messages.sort(this.sortMessagesByPriority);
    }
    /**
     * Sort the Messages by priority.
     */
    sortMessagesByPriority(msgA, msgB) {
        let num = 0;
        if (Number(msgA.priority) < Number(msgB.priority))
            num = -1;
        if (Number(msgA.priority) > Number(msgB.priority))
            num = 1;
        return num;
    }
    /**
     * Flush the queue.
     *
     * NOTE: This empties the queue.
     * @return boolean true if all messages written successfully.
     */
    flush() {
        var _a;
        let success = true;
        let message = this.messages.shift();
        while (message !== null) {
            success = ((_a = this.output) === null || _a === void 0 ? void 0 : _a.write(message)) || false;
            message = this.messages.shift();
        }
        return success;
    }
}
exports.Queue = Queue;
