import { Pipe } from "./Pipe.js";
import { IPipeFitting } from "../types/pipe.js";
import { IPipeMessage } from "../types/message.js";
import { PipeMessageType, QueueControlMessageType } from "../types/enum.js";

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
export class Queue extends Pipe {
  constructor(output?: IPipeFitting) {
    super(output);
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
  public override write(message: IPipeMessage): boolean {
    let success: boolean = true;
    switch (message.type) {
      // Store normal messages
      case PipeMessageType.NORMAL:
        this.store(message);
        break;

      // Flush the queue
      case QueueControlMessageType.FLUSH:
        success = this.flush();
        break;

      // Put Queue into Priority Sort or FIFO mode
      // Subsequent messages written to the queue
      // will be affected. Sorted messages cannot
      // be put back into FIFO order!
      case QueueControlMessageType.SORT:
      case QueueControlMessageType.FIFO:
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
  protected store(message: IPipeMessage): void {
    this.messages.push(message);
    if (this.mode === QueueControlMessageType.SORT)
      this.messages.sort(this.sortMessagesByPriority);
  }

  /**
   * Sort the Messages by priority.
   */
  protected sortMessagesByPriority(
    msgA: IPipeMessage,
    msgB: IPipeMessage,
  ): number {
    let num: number = 0;
    if (Number(msgA.priority) < Number(msgB.priority)) num = -1;
    if (Number(msgA.priority) > Number(msgB.priority)) num = 1;
    return num;
  }

  /**
   * Flush the queue.
   *
   * NOTE: This empties the queue.
   * @return boolean true if all messages written successfully.
   */
  protected flush(): boolean {
    let success: boolean = true;
    let message: IPipeMessage | undefined = this.messages.shift();
    while (message !== undefined) {
      success = this.output?.write(message) || false;
      message = this.messages.shift();
    }
    return success;
  }

  protected mode: string = QueueControlMessageType.SORT;
  protected messages: Array<IPipeMessage> = new Array<IPipeMessage>();
}
