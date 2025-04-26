import {
  PipeMessageType,
  FilterControlMessageType,
  QueueControlMessageType,
} from ".";

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
export interface PipeMessage {
  type: PipeMessageType | FilterControlMessageType | QueueControlMessageType;
  header?: object | undefined;
  body?: object | undefined;
  priority?: number | undefined;
}

/**
 * Filter Control Messages.
 *
 * A special message type for controlling the behavior of a Filter.
 *
 * The `FilterControlMessage.SET_PARAMS` message type tells the Filter
 * to retrieve the filter parameters object.
 *
 * The `FilterControlMessage.SET_FILTER` message type tells the Filter
 * to retrieve the filter function.
 *
 * The `FilterControlMessage.BYPASS` message type tells the Filter
 * that it should go into Bypass mode operation, passing all normal
 * messages through unfiltered.
 *
 * The `FilterControlMessage.FILTER` message type tells the Filter
 * that it should go into Filtering mode operation, filtering all
 * normal messages before writing out. This is the default
 * mode of operation and so this message type need only be sent to
 * cancel a previous  `FilterControlMessage.BYPASS` message.
 *
 * The Filter only acts on a control message if it is targeted
 * to this named filter instance. Otherwise, it writes the message
 * through to its output unchanged.
 */
export interface FilterControlMessage extends PipeMessage {
  name: string;
  type: FilterControlMessageType;
  filter: (message: PipeMessage) => boolean;
  params?: object;
}

/**
 * Queue Control Messages.
 *
 * A special message for controlling the behavior of a Queue.
 *
 * When written to a pipeline containing a Queue, the type
 * of the message is interpreted and acted upon by the Queue.
 *
 * Unlike filters, multiple serially connected queues aren't
 * very useful, and so they do not require a name. If multiple
 * queues are connected serially, the message will be acted
 * upon by the first queue only.
 */
export interface QueueControlMessage extends PipeMessage {
  type: QueueControlMessageType;
}
