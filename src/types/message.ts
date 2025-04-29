import {
  PipeMessageType,
  FilterControlMessageType,
  QueueControlMessageType,
} from "./enum";

/**
 * Pipe Message Interface.
 *
 * `Messages`s are objects written into a pipeline,
 * composed of `IPipeFitting`s. The message is passed from
 * one fitting to the next in synchronous fashion.
 *
 * Depending on type, messages may be handled differently by
 * the fittings.
 */
export interface IPipeMessage {
  type: PipeMessageType | FilterControlMessageType | QueueControlMessageType;
  header?: { [key: string]: unknown } | undefined;
  body?: { [key: string]: unknown } | undefined;
  priority?: number | undefined;
}

/**
 * Filter Control Messages.
 *
 * A special message type for controlling the behavior of a Filter.
 *
 * The `FilterControlMessageType.SET_PARAMS` message type tells the Filter
 * to retrieve the filter parameters object.
 *
 * The `FilterControlMessageType.SET_FILTER` message type tells the Filter
 * to retrieve the filter function.
 *
 * The `FilterControlMessageType.BYPASS` message type tells the Filter
 * that it should go into Bypass mode operation, passing all normal
 * messages through unfiltered.
 *
 * The `FilterControlMessageType.FILTER` message type tells the Filter
 * that it should go into Filtering mode operation, filtering all
 * normal messages before writing out. This is the default
 * mode of operation and so this message type need only be sent to
 * cancel a previous  `FilterControlMessageType.BYPASS` message.
 *
 * The Filter only acts on a control message if it is targeted
 * to this named filter instance. Otherwise, it writes the message
 * through to its output unchanged.
 */
export interface FilterControlMessage extends IPipeMessage {
  name: string;
  type: FilterControlMessageType;
  filter?: (message: IPipeMessage) => boolean;
  params?: { [key: string]: unknown };
}

/**
 * Queue Control Messages.
 *
 * A special message for controlling the behavior of a Queue.
 *
 * When written to a pipeline containing a Queue, the type
 * of the message is interpreted and acted upon by the Queue.
 *
 * The `QueueControlMessageType.FLUSH` message type tells the Queue
 * that it should flush all messages, writing them to its output until
 * the queue is empty.
 *
 * The `QueueControlMessageType.SORT` message type tells the Queue
 * that it should sort all subsequent messages by priority.
 * If there are un-flushed messages in the queue, they will not be
 * sorted unless a new message is sent before the next FLUSH.
 * Sorting-by-priority behavior continues even after a FLUSH,
 * and can be turned off by sending a FIFO message, which is
 * the default behavior for enqueue/dequeue.
 *
 * Unlike filters, multiple serially connected queues aren't
 * very useful, and so they do not require a name. If multiple
 * queues are connected serially, the message will be acted
 * upon by the first queue only.
 */
export interface QueueControlMessage extends IPipeMessage {
  type: QueueControlMessageType;
}
