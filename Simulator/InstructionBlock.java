/**
 * @author Vitaliy Lvin (vlvin@cs.umass.edu)
 * Copyright 2005 University of Massachusetts - Amherst
 */
import java.util.*;

/**
 * Instances of this class correspond to lines in trace files
 * They should be discarded when repetitons count reaches 0
 */
public class InstructionBlock {
	/**
	 * # of repetitions of this instructions
	 */
	private int repetitions;
	/**
	 * instruction code
	 */
	private char code;
	/**
	 * instruction-dependent data
	 */
	private long data;
	/**
	 * Process that instruction belongs to
	 */
	private ProcessTrace parent;
	
	//constants for intruction codes
	public static final char READ = 'R';
	public static final char WRITE = 'W';
	public static final char EXECUTE = 'I';
	public static final char FILE_READ = '<';
	public static final char FILE_WRITE = '>';
	public static final char SLEEP = 'S';
	public static final char FILE_OPEN = '(';
	public static final char FILE_CLOSE = ')';
	
	
	/**
	 * Creates new instuction block.
	 * @param parent parent process
	 * @param s One line from trace file
	 */
	public InstructionBlock(ProcessTrace parent, String s) {
		this.parent = parent;
		//line should look like <repetitions> <code> <data>
		StringTokenizer st = new StringTokenizer(s);
		repetitions = Integer.parseInt(st.nextToken());
		code = st.nextToken().toUpperCase().charAt(0);
		data = Long.parseLong(st.nextToken());
	}
	
	/**
	 * Returns number of repetitons of the instruction
	 * @return
	 */
	public int getRepetitions() {
		return repetitions;
	}

	/**
	 * Retuns instruction code.
	 * @return
	 */
	public char getInstructionCode() {
		return code;
	}
	
	/**
	 * Returns instruction's data
	 * @return
	 */
	public long getData() {
		return data;
	}
	
	/**
	 * Reduces repetitions by 1,
	 * removes instruction from the parent process when
	 * repetitions count reaches 0
	 */
	public void executeOnce() {
		if (repetitions > 0) {
			repetitions--;
		}
		else parent.removeInstruction(this);
	}	
}