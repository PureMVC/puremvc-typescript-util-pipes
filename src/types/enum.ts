/**
 * Messages Priority
 * - HIGH -can be sorted to the front of the queue
 * - MEDIUM - default
 * - LOW - can be sorted to the end of the queue
 */
export enum MessagePriority {
  HIGH = "HIGH",
  MEDIUM = "MED",
  LOW = "LOW",
}

/**
 * Pipe Message Types.
 */
export enum PipeMessageType {
  NORMAL = "NORMAL",
}

/**
 * Filter Control Message Types.
 */
export enum FilterControlMessageType {
  SET_PARAMS = "SET_PARAMS",
  SET_FILTER = "SET_FILTER",
  BYPASS = "BYPASS",
  FILTER = "FILTER",
}

/**
 * Queue Control Message Types.
 */
export enum QueueControlMessageType {
  FLUSH = "FLUSH",
  SORT = "SORT",
  FIFO = "FIFO",
}

/**
 * The valid Junction types
 */
export enum JunctionType {
  INPUT = "INPUT",
  OUTPUT = "OUTPUT",
}

/**
 * The valid Junction Mediator Notifications
 */
export enum JunctionMediatorNotification {
  ACCEPT_INPUT_PIPE = "ACCEPT_INPUT_PIPE",
  ACCEPT_OUTPUT_PIPE = "ACCEPT_OUTPUT_PIPE",
}
