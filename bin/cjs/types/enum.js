"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JunctionMediatorNotification = exports.JunctionType = exports.QueueControlMessageType = exports.FilterControlMessageType = exports.PipeMessageType = exports.MessagePriority = void 0;
/**
 * Messages Priority
 * - HIGH -can be sorted to the front of the queue
 * - MEDIUM - default
 * - LOW - can be sorted to the end of the queue
 */
var MessagePriority;
(function (MessagePriority) {
    MessagePriority["HIGH"] = "HIGH";
    MessagePriority["MEDIUM"] = "MED";
    MessagePriority["LOW"] = "LOW";
})(MessagePriority || (exports.MessagePriority = MessagePriority = {}));
/**
 * Pipe Message Types.
 */
var PipeMessageType;
(function (PipeMessageType) {
    PipeMessageType["NORMAL"] = "NORMAL";
})(PipeMessageType || (exports.PipeMessageType = PipeMessageType = {}));
/**
 * Filter Control Message Types.
 */
var FilterControlMessageType;
(function (FilterControlMessageType) {
    FilterControlMessageType["SET_PARAMS"] = "SET_PARAMS";
    FilterControlMessageType["SET_FILTER"] = "SET_FILTER";
    FilterControlMessageType["BYPASS"] = "BYPASS";
    FilterControlMessageType["FILTER"] = "FILTER";
})(FilterControlMessageType || (exports.FilterControlMessageType = FilterControlMessageType = {}));
/**
 * Queue Control Message Types.
 */
var QueueControlMessageType;
(function (QueueControlMessageType) {
    QueueControlMessageType["FLUSH"] = "FLUSH";
    QueueControlMessageType["SORT"] = "SORT";
    QueueControlMessageType["FIFO"] = "FIFO";
})(QueueControlMessageType || (exports.QueueControlMessageType = QueueControlMessageType = {}));
/**
 * The valid Junction types
 */
var JunctionType;
(function (JunctionType) {
    JunctionType["INPUT"] = "INPUT";
    JunctionType["OUTPUT"] = "OUTPUT";
})(JunctionType || (exports.JunctionType = JunctionType = {}));
/**
 * The valid Junction Mediator Notifications
 */
var JunctionMediatorNotification;
(function (JunctionMediatorNotification) {
    JunctionMediatorNotification["ACCEPT_INPUT_PIPE"] = "ACCEPT_INPUT_PIPE";
    JunctionMediatorNotification["ACCEPT_OUTPUT_PIPE"] = "ACCEPT_OUTPUT_PIPE";
})(JunctionMediatorNotification || (exports.JunctionMediatorNotification = JunctionMediatorNotification = {}));
