import { Pipe, IPipeFitting, IPipeMessage } from "../index";
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
export declare class Queue extends Pipe {
    constructor(output?: IPipeFitting);
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
    write(message: IPipeMessage): boolean;
    /**
     * Store a message.
     * @param message the PipeMessage to enqueue.
     * @return number the new count of messages in the queue
     */
    protected store(message: IPipeMessage): void;
    /**
     * Sort the Messages by priority.
     */
    protected sortMessagesByPriority(msgA: IPipeMessage, msgB: IPipeMessage): number;
    /**
     * Flush the queue.
     *
     * NOTE: This empties the queue.
     * @return boolean true if all messages written successfully.
     */
    protected flush(): boolean;
    protected mode: string;
    protected messages: Array<IPipeMessage>;
}
