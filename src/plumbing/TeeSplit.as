/*
 PureMVC AS3/MultiCore Utility – Pipes
 Copyright (c) 2008 Cliff Hall<cliff.hall@puremvc.org>
 Your reuse is governed by the Creative Commons Attribution 3.0 License
 */
package org.puremvc.as3.multicore.utilities.pipes.plumbing
{
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeFitting;
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.PipeMessage;

	/**
	 * Splitting Pipe Tee.
	 *
	 * Writes input messages to multiple output pipe fittings.
	 */
	public class TeeSplit implements IPipeFitting
	{
		protected var outputs:Array = new Array();

		/**
		 * Constructor.
		 *
		 * Create the TeeSplit and connect the up two optional outputs.
		 * This is the most common configuration, though you can connect
		 * as many outputs as necessary by calling `connect`.
		 */
		public function TeeSplit( output1:IPipeFitting=null, output2:IPipeFitting=null )
		{
			if (output1) connect(output1);
			if (output2) connect(output2);
		}

		/**
		 * Connect the output IPipeFitting.
		 *
		 * NOTE: You can connect as many outputs as you want
		 * by calling this method repeatedly.
		 *
		 * @param output the IPipeFitting to connect for output.
		 */
		public function connect( output:IPipeFitting ):boolean
		{
			outputs.push(output);
			return true;
		}

		/**
		 * Disconnect the most recently connected output fitting. (LIFO)
		 *
		 * To disconnect all outputs, you must call this
		 * method repeatedly untill it returns null.
		 *
		 * @param output the IPipeFitting to connect for output.
		 */
		public function disconnect( ):IPipeFitting
		{
			return outputs.pop() as IPipeFitting;
		}

		/**
		 * Disconnect a given output fitting.
		 *
		 * If the fitting passed in is connected
		 * as an output of this `TeeSplit`, then
		 * it is disconnected and the reference returned.
		 *
		 * If the fitting passed in is not connected as an
		 * output of this `TeeSplit`, then `null`
		 * is returned.
		 *
		 * @param output the IPipeFitting to connect for output.
		 */
		public function disconnectFitting( target:IPipeFitting ):IPipeFitting
		{
			var removed:IPipeFitting;
			for (var i:number=0;i<outputs.length;i++)
			{
				var output:IPipeFitting = outputs[i];
				if (output === target) {
					outputs.splice(i,1);
					removed=output;
					break;
				}
			}
			return removed;
		}

		/**
		 * Write the message to all connected outputs.
		 *
		 * Returns false if any output returns false,
		 * but all outputs are written to regardless.
		 * @param message the message to write
		 * @return boolean whether any connected outputs failed
		 */
		public function write( message:PipeMessage ):boolean
		{
			var success:boolean = true;
			for (var i:number=0;i<outputs.length;i++)
			{
				var output:IPipeFitting = outputs[i];
				if (! output.write( message ) ) success = false;
			}
			return success;
		}

	}
}
