/**
 * @author Vitaliy Lvin (vlvin@cs.umass.edu)
 * Copyright 2005 University of Massachusetts - Amherst
 */

/**
 * Represents an object that can be woken up from sleep 
 * or notified of some event
 */
public interface Wakeable {
	/**
	 * Notifies the object of a completed disk request
	 * @param scheduler CPU scheduler
	 * @param request completed disk request
	 */
	public void wakeUp(AbstractCPUScheduler scheduler, DiskRequest request);

}
