import { IPipeFitting, PipeListenerCallback, IPipeMessage } from "../index";
import { JunctionType } from "../types/enum";
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
export declare class Junction {
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
    registerPipe({ name, type, pipe, }: {
        name: string | undefined;
        type: JunctionType.INPUT | JunctionType.OUTPUT;
        pipe: IPipeFitting;
    }): boolean;
    /**
     * Does this junction have a pipe by this name?
     *
     * @param name the pipe to check for
     * @return boolean whether as pipe is registered with that name.
     */
    hasPipe(name: string): boolean;
    /**
     * Does this junction have an INPUT pipe by this name?
     *
     * @param name the pipe to check for
     * @return boolean whether an INPUT pipe is registered with that name.
     */
    hasInputPipe(name: string): boolean;
    /**
     * Does this junction have an OUTPUT pipe by this name?
     *
     * @param name the pipe to check for
     * @return boolean whether an OUTPUT pipe is registered with that name.
     */
    hasOutputPipe(name: string): boolean;
    /**
     * Remove the pipe with this name if it is registered.
     *
     * NOTE: You cannot have an INPUT pipe and an OUTPUT
     * pipe registered with the same name. All pipe names
     * must be unique regardless of type.
     *
     * @param name the pipe to remove
     */
    removePipe(name: string): void;
    /**
     * Retrieve the named pipe.
     *
     * @param name the pipe to retrieve
     * @return IPipeFitting the pipe registered by the given name if it exists
     */
    retrievePipe(name: string): IPipeFitting | undefined;
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
    addPipeListener(inputPipeName: string, listener: PipeListenerCallback): boolean;
    /**
     * Send a message on an OUTPUT pipe.
     *
     * @param outputPipeName the OUTPUT pipe to send the message on
     * @param message the PipeMessage to send
     */
    sendMessage(outputPipeName: string, message: IPipeMessage): boolean;
    /**
     *  The names of the INPUT pipes
     */
    protected inputPipes: Set<string>;
    /**
     *  The names of the OUTPUT pipes
     */
    protected outputPipes: Set<string>;
    /**
     * The map of pipe names to their pipes
     */
    protected pipesMap: Map<string, IPipeFitting>;
    /**
     * The map of pipe names to their types
     * @type {Map<string, JunctionType.INPUT | JunctionType.OUTPUT>}
     */
    protected pipeTypesMap: Map<string, JunctionType.INPUT | JunctionType.OUTPUT>;
}
