/*
 PureMVC AS3/MultiCore Utility – Pipes
 Copyright (c) 2008 Cliff Hall<cliff.hall@puremvc.org>
 Your reuse is governed by the Creative Commons Attribution 3.0 License
 */
package org.puremvc.as3.multicore.utilities.pipes.plumbing
{
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeFitting;

	/**
	 * Merging Pipe Tee.
	 *
	 * Writes the messages from multiple input pipelines into
	 * a single output pipe fitting.
	 */
	public class TeeMerge extends Pipe
	{

		/**
		 * Constructor.
		 *
		 * Create the TeeMerge and the two optional constructor inputs.
		 * This is the most common configuration, though you can connect
		 * as many inputs as necessary by calling `connectInput`
		 * repeatedly.
		 *
		 * Connect the single output fitting normally by calling the
		 * `connect` method, as you would with any other IPipeFitting.
		 */
		public function TeeMerge( input1:IPipeFitting=null, input2:IPipeFitting=null )
		{
			if (input1) connectInput(input1);
			if (input2) connectInput(input2);
		}

		/**
		 * Connect an input IPipeFitting.
		 *
		 * NOTE: You can connect as many inputs as you want
		 * by calling this method repeatedly.
		 *
		 * @param input the IPipeFitting to connect for input.
		 */
		public function connectInput( input:IPipeFitting ):boolean
		{
			return input.connect(this);
		}

	}
}
