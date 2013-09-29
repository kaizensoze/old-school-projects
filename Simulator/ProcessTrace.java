/**
 * @author Vitaliy Lvin (vlvin@cs.umass.edu)
 * Copyright 2005 University of Massachusetts - Amherst
 */

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.*;

/**
 * Encapsulates a process as a list of InstructionBlocks
 */
public class ProcessTrace implements Wakeable {
	/**
	 * queue of instructions
	 */
	private Queue<InstructionBlock> instructions = new LinkedList<InstructionBlock>();
	
	/**
	 * Creates a process object from a trace 
	 * @param filename file containing the trace
	 */
	public ProcessTrace(String filename) {
		//check if file exists
		//if not cannot create process, return null
		//should be exception, maybe?
		File f = new File(filename);
		if (!f.exists()) {
			System.out.println("File " + filename + "does not exist!");
			System.exit(1);
		}
		
		//try to read in instructions from file
		try {
			BufferedReader reader = new BufferedReader(new FileReader(f));
			while (reader.ready()) 
				instructions.offer(new InstructionBlock(this, reader.readLine()));				
			reader.close();
		}
		catch (IOException e) {
			System.out.println("Cannot read file " + filename + ".");
			System.exit(1);
		}
		
	}
	
	/**
	 * Returns next instruction that needs to be executed
	 * @return instruction block
	 */
	public InstructionBlock getNextInstructionBlock() {
		return instructions.peek();
	}
	
	/**
	 * Removes instruction from the list of instructions
	 * @param i instruction to be removed
	 */
	public void removeInstruction(InstructionBlock i) {
		instructions.remove(i);
	}
	
	/**
	 * Notifies the process that its disk request was fulfilled
	 */
	public void wakeUp(AbstractCPUScheduler scheduler, DiskRequest request) {
		//can go on, so unblock
		scheduler.unblocked(this);
	}
}
