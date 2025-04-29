"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Junction = void 0;
const index_1 = require("../index");
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
class Junction {
    constructor() {
        /**
         *  The names of the INPUT pipes
         */
        this.inputPipes = new Set();
        /**
         *  The names of the OUTPUT pipes
         */
        this.outputPipes = new Set();
        /**
         * The map of pipe names to their pipes
         */
        this.pipesMap = new Map();
        /**
         * The map of pipe names to their types
         * @type {Map<string, JunctionType.INPUT | JunctionType.OUTPUT>}
         */
        this.pipeTypesMap = new Map();
    }
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
    registerPipe({ name, type, pipe, }) {
        if (!name)
            return false;
        let success = true;
        if (!this.pipesMap.get(name)) {
            this.pipesMap.set(name, pipe);
            this.pipeTypesMap.set(name, type);
            switch (type) {
                case index_1.JunctionType.INPUT:
                    this.inputPipes.add(name);
                    break;
                case index_1.JunctionType.OUTPUT:
                    this.outputPipes.add(name);
                    break;
                default:
                    success = false;
            }
        }
        else {
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
    hasPipe(name) {
        return this.pipesMap.get(name) !== null;
    }
    /**
     * Does this junction have an INPUT pipe by this name?
     *
     * @param name the pipe to check for
     * @return boolean whether an INPUT pipe is registered with that name.
     */
    hasInputPipe(name) {
        return (this.hasPipe(name) && this.pipeTypesMap.get(name) === index_1.JunctionType.INPUT);
    }
    /**
     * Does this junction have an OUTPUT pipe by this name?
     *
     * @param name the pipe to check for
     * @return boolean whether an OUTPUT pipe is registered with that name.
     */
    hasOutputPipe(name) {
        return (this.hasPipe(name) && this.pipeTypesMap.get(name) === index_1.JunctionType.OUTPUT);
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
    removePipe(name) {
        if (this.hasPipe(name)) {
            let type = this.pipeTypesMap.get(name);
            let pipesList;
            switch (type) {
                case index_1.JunctionType.INPUT:
                    pipesList = this.inputPipes;
                    break;
                case index_1.JunctionType.OUTPUT:
                    pipesList = this.outputPipes;
                    break;
                default:
                    pipesList = new Set();
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
    retrievePipe(name) {
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
    addPipeListener(inputPipeName, listener) {
        let success = false;
        if (this.hasInputPipe(inputPipeName)) {
            let pipe = this.pipesMap.get(inputPipeName);
            success = (pipe === null || pipe === void 0 ? void 0 : pipe.connect(new index_1.PipeListener(listener))) || false;
        }
        return success;
    }
    /**
     * Send a message on an OUTPUT pipe.
     *
     * @param outputPipeName the OUTPUT pipe to send the message on
     * @param message the PipeMessage to send
     */
    sendMessage(outputPipeName, message) {
        let success = false;
        if (this.hasOutputPipe(outputPipeName)) {
            let pipe = this.pipesMap.get(outputPipeName);
            success = (pipe === null || pipe === void 0 ? void 0 : pipe.write(message)) || false;
        }
        return success;
    }
}
exports.Junction = Junction;
