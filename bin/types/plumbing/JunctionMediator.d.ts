import { INotification, Mediator } from "@puremvc/puremvc-typescript-multicore-framework";
import { IPipeMessage } from "../index";
import { Junction } from "./Junction";
/**
 * Junction Mediator.
 *
 * A base class for handling the Pipe Junction in an IPipeAware Core.
 */
export declare abstract class JunctionMediator extends Mediator {
    /**
     * Constructor.
     */
    constructor(name: string, junction: Junction);
    /**
     * List Notification Interests.
     *
     * Returns the notification interests for this base class.
     * Override in subclass and call `super.listNotificationInterests`
     * to get this list, then add any subclass interests to
     * the array before returning.
     */
    listNotificationInterests(): string[];
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
    handleNotification(note: INotification): void;
    /**
     * Handle incoming pipe messages.
     *
     * Override in subclass and handle messages appropriately for the module.
     */
    abstract handlePipeMessage(message: IPipeMessage): void;
    /**
     * The Junction for this Module.
     */
    protected get junction(): Junction;
}
