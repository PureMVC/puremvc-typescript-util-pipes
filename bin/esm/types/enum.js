/**
 * Messages Priority
 * - HIGH -can be sorted to the front of the queue
 * - MEDIUM - default
 * - LOW - can be sorted to the end of the queue
 */
export var MessagePriority;
(function (MessagePriority) {
    MessagePriority["HIGH"] = "HIGH";
    MessagePriority["MEDIUM"] = "MED";
    MessagePriority["LOW"] = "LOW";
})(MessagePriority || (MessagePriority = {}));
/**
 * Pipe Message Types.
 */
export var PipeMessageType;
(function (PipeMessageType) {
    PipeMessageType["NORMAL"] = "NORMAL";
})(PipeMessageType || (PipeMessageType = {}));
/**
 * Filter Control Message Types.
 */
export var FilterControlMessageType;
(function (FilterControlMessageType) {
    FilterControlMessageType["SET_PARAMS"] = "SET_PARAMS";
    FilterControlMessageType["SET_FILTER"] = "SET_FILTER";
    FilterControlMessageType["BYPASS"] = "BYPASS";
    FilterControlMessageType["FILTER"] = "FILTER";
})(FilterControlMessageType || (FilterControlMessageType = {}));
/**
 * Queue Control Message Types.
 */
export var QueueControlMessageType;
(function (QueueControlMessageType) {
    QueueControlMessageType["FLUSH"] = "FLUSH";
    QueueControlMessageType["SORT"] = "SORT";
    QueueControlMessageType["FIFO"] = "FIFO";
})(QueueControlMessageType || (QueueControlMessageType = {}));
/**
 * The valid Junction types
 */
export var JunctionType;
(function (JunctionType) {
    JunctionType["INPUT"] = "INPUT";
    JunctionType["OUTPUT"] = "OUTPUT";
})(JunctionType || (JunctionType = {}));
/**
 * The valid Junction Mediator Notifications
 */
export var JunctionMediatorNotification;
(function (JunctionMediatorNotification) {
    JunctionMediatorNotification["ACCEPT_INPUT_PIPE"] = "ACCEPT_INPUT_PIPE";
    JunctionMediatorNotification["ACCEPT_OUTPUT_PIPE"] = "ACCEPT_OUTPUT_PIPE";
})(JunctionMediatorNotification || (JunctionMediatorNotification = {}));
