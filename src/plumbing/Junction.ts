import {
  IPipeFitting,
  PipeListener,
  PipeListenerCallback,
  IPipeMessage,
  JunctionType,
} from "../types";

/**
 * Pipe Junction.
 *
 * Manages Pipes for a Module.
 *
 * When you register a Pipe with a Junction, it is
 * declared as being an INPUT pipe or an OUTPUT pipe.
 *
 * You can retrieve or remove a registered Pipe by name,
 * check to see if a Pipe with a given name exists,or if
 * it exists AND is an INPUT or an OUTPUT Pipe.
 *
 * You can send an `PipeMessage` on a named INPUT Pipe
 * or add a `PipeListener` to registered INPUT Pipe.
 */
export class Junction {
  /**
   * Register a pipe with the junction.
   *
   * Pipes are registered by unique name and type,
   * which must be either `Junction.INPUT`
   * or `Junction.OUTPUT`.
   *
   * NOTE: You cannot have an INPUT pipe and an OUTPUT
   * pipe registered with the same name. All pipe names
   * must be unique regardless of type.
   *
   * @return boolean true if successfully registered. false if another pipe exists by that name.
   */
  public registerPipe({
    name,
    type,
    pipe,
  }: {
    name: string | undefined;
    type: JunctionType.INPUT | JunctionType.OUTPUT;
    pipe: IPipeFitting;
  }): boolean {
    if (!name) return false;
    let success: boolean = true;
    if (!this.pipesMap.get(name)) {
      this.pipesMap.set(name, pipe);
      this.pipeTypesMap.set(name, type);

      switch (type) {
        case JunctionType.INPUT:
          this.inputPipes.add(name);
          break;

        case JunctionType.OUTPUT:
          this.outputPipes.add(name);
          break;

        default:
          success = false;
      }
    } else {
      success = false;
    }
    return success;
  }

  /**
   * Does this junction have a pipe by this name?
   *
   * @param name the pipe to check for
   * @return boolean whether as pipe is registered with that name.
   */
  public hasPipe(name: string): boolean {
    return this.pipesMap.get(name) !== null;
  }

  /**
   * Does this junction have an INPUT pipe by this name?
   *
   * @param name the pipe to check for
   * @return boolean whether an INPUT pipe is registered with that name.
   */
  public hasInputPipe(name: string): boolean {
    return (
      this.hasPipe(name) && this.pipeTypesMap.get(name) === JunctionType.INPUT
    );
  }

  /**
   * Does this junction have an OUTPUT pipe by this name?
   *
   * @param name the pipe to check for
   * @return boolean whether an OUTPUT pipe is registered with that name.
   */
  public hasOutputPipe(name: string): boolean {
    return (
      this.hasPipe(name) && this.pipeTypesMap.get(name) === JunctionType.OUTPUT
    );
  }

  /**
   * Remove the pipe with this name if it is registered.
   *
   * NOTE: You cannot have an INPUT pipe and an OUTPUT
   * pipe registered with the same name. All pipe names
   * must be unique regardless of type.
   *
   * @param name the pipe to remove
   */
  public removePipe(name: string): void {
    if (this.hasPipe(name)) {
      let type: JunctionType | undefined = this.pipeTypesMap.get(name);
      let pipesList: Set<string>;

      switch (type) {
        case JunctionType.INPUT:
          pipesList = this.inputPipes;
          break;

        case JunctionType.OUTPUT:
          pipesList = this.outputPipes;
          break;

        default:
          pipesList = new Set<string>();
          break;
      }

      for (const item of pipesList) {
        if (item === name) {
          pipesList.delete(item);
          break;
        }
      }
      this.pipesMap.delete(name);
      this.pipeTypesMap.delete(name);
    }
  }

  /**
   * Retrieve the named pipe.
   *
   * @param name the pipe to retrieve
   * @return IPipeFitting the pipe registered by the given name if it exists
   */
  public retrievePipe(name: string): IPipeFitting | undefined {
    return this.pipesMap.get(name);
  }

  /**
   * Add a PipeListener to an INPUT pipe.
   *
   * NOTE: there can only be one PipeListener per pipe,
   * and the listener function must accept an PipeMessage
   * as its sole argument.
   *
   * @param inputPipeName the INPUT pipe to add a PipeListener to
   * @param listener the callback function to invoke
   */
  public addPipeListener(
    inputPipeName: string,
    listener: PipeListenerCallback,
  ): boolean {
    let success: boolean = false;
    if (this.hasInputPipe(inputPipeName)) {
      let pipe: IPipeFitting | undefined = this.pipesMap.get(inputPipeName);
      success = pipe?.connect(new PipeListener(listener)) || false;
    }
    return success;
  }

  /**
   * Send a message on an OUTPUT pipe.
   *
   * @param outputPipeName the OUTPUT pipe to send the message on
   * @param message the PipeMessage to send
   */
  public sendMessage(outputPipeName: string, message: IPipeMessage): boolean {
    let success: boolean = false;
    if (this.hasOutputPipe(outputPipeName)) {
      let pipe: IPipeFitting | undefined = this.pipesMap.get(outputPipeName);
      success = pipe?.write(message) || false;
    }
    return success;
  }

  /**
   *  The names of the INPUT pipes
   */
  protected inputPipes: Set<string> = new Set<string>();

  /**
   *  The names of the OUTPUT pipes
   */
  protected outputPipes: Set<string> = new Set<string>();

  /**
   * The map of pipe names to their pipes
   */
  protected pipesMap: Map<string, IPipeFitting> = new Map<
    string,
    IPipeFitting
  >();

  /**
   * The map of pipe names to their types
   * @type {Map<string, JunctionType.INPUT | JunctionType.OUTPUT>}
   */
  protected pipeTypesMap: Map<
    string,
    JunctionType.INPUT | JunctionType.OUTPUT
  > = new Map<string, JunctionType.INPUT | JunctionType.OUTPUT>();
}
