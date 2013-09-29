/**
 * @author Vitaliy Lvin (vlvin@cs.umass.edu)
 * Copyright 2005 University of Massachusetts - Amherst
 */

/**
 * Base class for all memory managers
 */
public abstract class AbstractVMManager  implements Wakeable{
	//result constants
	public static final int PAGE_FAULT = -1;
	public static final int SUCCESS = 0;
	/**
	 * Attempts to read from a virtual page
	 * @param virtualAddress number of the virtual space
	 * @return PAGE_FAULT if page is not in memory, SUCCESS otherwise
	 */ 
	public abstract int read(long virtualAddress);
	/**
	 * Attempts to write to a virtual page
	 * @param virtualAddress number of the virtual space
	 * @return PAGE_FAULT if page is not in memory, SUCCESS otherwise
	 */ 
	public abstract int write(long virtualAddress);
	
	/**
	 * Translates between virtual memory pages and tracks on disk
	 * @param page page number
	 * @return track number
	 */
	public abstract long translatePageAddressToDiskTrack(long page);
	
	/**
	 * Report statistics to System.out
	 */
	public abstract void report(); 
}
