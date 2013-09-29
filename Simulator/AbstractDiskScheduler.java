/**
 * @author Vitaliy Lvin (vlvin@cs.umass.edu)
 * Copyright 2005 University of Massachusetts - Amherst
 */

/**
 * Parent class for all disk schedulers
 */
public abstract class AbstractDiskScheduler {
	/**
	 * Adds a request to disk scheduler queue
	 * @param r DiskRequest
	 */
	public abstract void addRequest(DiskRequest r);

	/**
	 * Checks whether there are any peding requests.
	 * @return true is there is at least one request pending
	 */
	public abstract boolean hadNextRequest();
	/**
	 * Returns the next request to be executed and removes it from the queue
	 * @return DiskRequest
	 */
	public abstract DiskRequest getNextRequest();
	
	/**
	 * Report statistics to System.out
	 */
	public abstract void report();
}
