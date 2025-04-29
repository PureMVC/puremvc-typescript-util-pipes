import { INotification, Mediator } from "@puremvc/puremvc-typescript-multicore-framework";
import { Junction, JunctionMediatorNotification, JunctionType, IPipeFitting, IPipeMessage } from "../types";

/**
 * Junction Mediator.
 *
 * A base class for handling the Pipe Junction in an IPipeAware Core.
 */
export abstract class JunctionMediator extends Mediator {
  /**
   * Constructor.
   */
  protected constructor(name: string, junction: Junction) {
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
  public override listNotificationInterests(): string[] {
    return [
      JunctionMediatorNotification.ACCEPT_INPUT_PIPE,
      JunctionMediatorNotification.ACCEPT_OUTPUT_PIPE,
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
  public override handleNotification(note: INotification): void {
    switch (note.name) {
      // accept an input pipe
      // register the pipe and if successful
      // set this mediator as its listener
      case JunctionMediatorNotification.ACCEPT_INPUT_PIPE:
        const inputPipeName: string | undefined = note.type;
        const inputPipe: IPipeFitting = note.body as IPipeFitting;
        if (
          this.junction.registerPipe({
            name: inputPipeName,
            type: JunctionType.INPUT,
            pipe: inputPipe,
          })
        )
          this.junction.addPipeListener(
            inputPipeName as string,
            (message: IPipeMessage) => this.handlePipeMessage(message),
          );
        break;

      // accept an output pipe
      case JunctionMediatorNotification.ACCEPT_OUTPUT_PIPE:
        const outputPipeName: string | undefined = note.type;
        const outputPipe: IPipeFitting = note.body as IPipeFitting;
        this.junction.registerPipe({
          name: outputPipeName,
          type: JunctionType.OUTPUT,
          pipe: outputPipe,
        });
        break;
    }
  }

  /**
   * Handle incoming pipe messages.
   *
   * Override in subclass and handle messages appropriately for the module.
   */
  public abstract handlePipeMessage(message: IPipeMessage): void;

  /**
   * The Junction for this Module.
   */
  protected get junction(): Junction {
    return this.viewComponent as Junction;
  }
}
