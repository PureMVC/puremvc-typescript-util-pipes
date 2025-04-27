import { Pipe } from "./Pipe";
import { IPipeFitting, IPipeMessage } from "../index";
import { FilterControlFunction } from "../types/pipe";
/**
 * Pipe Filter.
 *
 * Filters may modify the contents of messages before writing them to
 * their output pipe fitting. They may also have their parameters and
 * filter function passed to them by control message, as well as having
 * their Bypass/Filter operation mode toggled via control message.
 */
export declare class Filter extends Pipe {
    /**
     * Constructor.
     *
     * Optionally connect the output and set the parameters.
     */
    constructor({ name, output, filter, params, }: {
        name: string;
        output: IPipeFitting;
        filter: FilterControlFunction;
        params?: object | undefined;
    });
    /**
     * Handle the incoming message.
     *
     * If message type is normal, filter the message (unless in bypass mode)
     * and write the result to the output pipe fitting if the filter
     * operation is successful.
     *
     * The `FilterControlMessage.SET_PARAMS` message type tells the `Filter`
     * that the message class is FilterControlMessage, which it
     * casts the message to in order to retrieve the filter parameters
     * object if the message is addressed to this filter.
     *
     *
     * The `FilterControlMessage.SET_FILTER` message type tells the `Filter`
     * that the message class is FilterControlMessage, which it
     * casts the message to in order to retrieve the filter function.
     *
     *
     * The `FilterControlMessageType.BYPASS` message type tells the `Filter`
     * that it should go into Bypass mode operation, passing all normal
     * messages through unfiltered.
     *
     *
     * The `FilterControlMessage.FILTER` message type tells the `Filter`
     * that it should go into Filtering mode operation, filtering all
     * normal messages before writing out. This is the default
     * mode of operation and so this message type need only be sent to
     * cancel a previous BYPASS message.
     *
     *
     * The Filter only acts on the control message if it is targeted
     * to this named filter instance. Otherwise, it writes through to the
     * output.
     *
     * @return boolean True if the filter process does not throw an error and subsequent operations in the pipeline succeed.
     */
    write(message: IPipeMessage): boolean;
    /**
     * Is the message directed at this filter instance?
     */
    protected isTarget(message: IPipeMessage): boolean;
    /**
     * Filter the message.
     */
    protected applyFilter(message: IPipeMessage): IPipeMessage;
    protected mode: string;
    protected filter: (message: IPipeMessage, params: object | undefined) => boolean;
    protected params: object | undefined;
    protected name: string;
}
