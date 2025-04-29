import { FilterControlMessageType, PipeMessageType, Pipe } from "../types";
/**
 * Pipe Filter.
 *
 * Filters may modify the contents of messages before writing them to
 * their output pipe fitting. They may also have their parameters and
 * filter function passed to them by control message, as well as having
 * their Bypass/Filter operation mode toggled via control message.
 */
export class Filter extends Pipe {
    /**
     * Constructor.
     *
     * Optionally connect the output and set the parameters.
     */
    constructor({ name, output, filter, params, }) {
        super(output);
        this.mode = FilterControlMessageType.FILTER;
        this.filter = undefined;
        this.params = {};
        this.name = "Unnamed Filter";
        if (name)
            this.name = name;
        if (filter)
            this.filter = filter;
        if (params)
            this.params = params;
    }
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
    write(message) {
        var _a, _b, _c, _d, _e;
        let outputMessage;
        let success = true;
        // Filter normal messages
        switch (message.type) {
            case PipeMessageType.NORMAL:
                try {
                    if (this.mode === FilterControlMessageType.FILTER) {
                        outputMessage = this.applyFilter(message);
                    }
                    else {
                        outputMessage = message;
                    }
                    success = ((_a = this.output) === null || _a === void 0 ? void 0 : _a.write(outputMessage)) || false;
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                }
                catch (e) {
                    success = false;
                }
                break;
            // Accept parameters from control message
            case FilterControlMessageType.SET_PARAMS:
                if (this.isTarget(message)) {
                    this.params = message.params || {};
                }
                else {
                    success = ((_b = this.output) === null || _b === void 0 ? void 0 : _b.write(message)) || false;
                }
                break;
            // Accept filter function from control message
            case FilterControlMessageType.SET_FILTER:
                if (this.isTarget(message)) {
                    this.filter = message.filter;
                }
                else {
                    success = ((_c = this.output) === null || _c === void 0 ? void 0 : _c.write(message)) || false;
                }
                break;
            // Toggle between Filter or Bypass operational modes
            case FilterControlMessageType.BYPASS:
            case FilterControlMessageType.FILTER:
                if (this.isTarget(message)) {
                    this.mode = message.type;
                }
                else {
                    success = ((_d = this.output) === null || _d === void 0 ? void 0 : _d.write(message)) || false;
                }
                break;
            // Write control messages for other fittings through
            default:
                success = ((_e = this.output) === null || _e === void 0 ? void 0 : _e.write(message)) || false;
        }
        return success;
    }
    /**
     * Is the message directed at this filter instance?
     */
    isTarget(message) {
        return message.name === this.name;
    }
    /**
     * Filter the message.
     */
    applyFilter(message) {
        if (this.mode !== FilterControlMessageType.BYPASS && this.filter)
            this.filter(message, this.params);
        return message;
    }
}
