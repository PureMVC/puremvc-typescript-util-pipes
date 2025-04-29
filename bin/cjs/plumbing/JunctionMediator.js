"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JunctionMediator = void 0;
const puremvc_typescript_multicore_framework_1 = require("@puremvc/puremvc-typescript-multicore-framework");
const index_1 = require("../index");
/**
 * Junction Mediator.
 *
 * A base class for handling the Pipe Junction in an IPipeAware Core.
 */
class JunctionMediator extends puremvc_typescript_multicore_framework_1.Mediator {
    /**
     * Constructor.
     */
    constructor(name, junction) {
        super(name, junction);
    }
    /**
     * List Notification Interests.
     *
     * Returns the notification interests for this base class.
     * Override in subclass and call `super.listNotificationInterests`
     * to get this list, then add any subclass interests to
     * the array before returning.
     */
    listNotificationInterests() {
        return [
            index_1.JunctionMediatorNotification.ACCEPT_INPUT_PIPE,
            index_1.JunctionMediatorNotification.ACCEPT_OUTPUT_PIPE,
        ];
    }
    /**
     * Handle Notification.
     *
     * This provides the handling for common junction activities. It
     * accepts input and output pipes in response to `IPipeAware`
     * interface calls.
     *
     * Override in subclass, and call `super.handleNotification`
     * if none of the subclass-specific notification names are matched.
     */
    handleNotification(note) {
        switch (note.name) {
            // accept an input pipe
            // register the pipe and if successful
            // set this mediator as its listener
            case index_1.JunctionMediatorNotification.ACCEPT_INPUT_PIPE:
                const inputPipeName = note.type;
                const inputPipe = note.body;
                if (this.junction.registerPipe({
                    name: inputPipeName,
                    type: index_1.JunctionType.INPUT,
                    pipe: inputPipe,
                }))
                    this.junction.addPipeListener(inputPipeName, (message) => this.handlePipeMessage(message));
                break;
            // accept an output pipe
            case index_1.JunctionMediatorNotification.ACCEPT_OUTPUT_PIPE:
                const outputPipeName = note.type;
                const outputPipe = note.body;
                this.junction.registerPipe({
                    name: outputPipeName,
                    type: index_1.JunctionType.OUTPUT,
                    pipe: outputPipe,
                });
                break;
        }
    }
    /**
     * The Junction for this Module.
     */
    get junction() {
        return this.viewComponent;
    }
}
exports.JunctionMediator = JunctionMediator;
