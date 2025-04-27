import { Pipe } from "./Pipe";
import {
  FilterControlMessage,
  FilterControlMessageType,
  IPipeFitting,
  IPipeMessage,
  PipeMessageType,
} from "../index";
import { FilterControlFunction } from "../types/pipe";

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
  constructor({
    name,
    output,
    filter,
    params,
  }: {
    name: string;
    output: IPipeFitting;
    filter: FilterControlFunction;
    params?: object | undefined;
  }) {
    super(output);
    this.name = name;
    this.filter = filter;
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
  public override write(message: IPipeMessage): boolean {
    let outputMessage: IPipeMessage;
    let success: boolean = true;

    // Filter normal messages
    switch (message.type) {
      case PipeMessageType.NORMAL:
        try {
          if (this.mode === FilterControlMessageType.FILTER) {
            outputMessage = this.applyFilter(message);
          } else {
            outputMessage = message;
          }
          success = this.output?.write(outputMessage) || false;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e: unknown) {
          success = false;
        }
        break;

      // Accept parameters from control message
      case FilterControlMessageType.SET_PARAMS:
        if (this.isTarget(message)) {
          this.params = (message as FilterControlMessage).params;
        } else {
          success = this.output?.write(message) || false;
        }
        break;

      // Accept filter function from control message
      case FilterControlMessageType.SET_FILTER:
        if (this.isTarget(message)) {
          this.filter = (message as FilterControlMessage).filter;
        } else {
          success = this.output?.write(message) || false;
        }
        break;

      // Toggle between Filter or Bypass operational modes
      case FilterControlMessageType.BYPASS:
      case FilterControlMessageType.FILTER:
        if (this.isTarget(message)) {
          this.mode = (message as FilterControlMessage).type;
        } else {
          success = this.output?.write(message) || false;
        }
        break;

      // Write control messages for other fittings through
      default:
        success = this.output?.write(message) || false;
    }
    return success;
  }

  /**
   * Is the message directed at this filter instance?
   */
  protected isTarget(message: IPipeMessage): boolean {
    return (message as FilterControlMessage).name === this.name;
  }

  /**
   * Filter the message.
   */
  protected applyFilter(message: IPipeMessage): IPipeMessage {
    this.filter(message, this.params);
    return message;
  }

  protected mode: string = FilterControlMessageType.FILTER;
  protected filter: (
    message: IPipeMessage,
    params: object | undefined,
  ) => boolean;
  protected params: object | undefined = undefined;
  protected name: string;
}
