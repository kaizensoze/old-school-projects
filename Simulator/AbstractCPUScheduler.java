/**
 * @author Vitaliy Lvin (vlvin@cs.umass.edu)
 * Copyright 2005 University of Massachusetts - Amherst
 */
import java.util.*;
/**
 * Base class for all the CPU schedulers
 */
public abstract class AbstractCPUScheduler {
	/**
	 * Adds a list of process traces to the scheduler
	 * @param list
	 */
	public abstract void addProcessTraces(Collection<ProcessTrace> list);
	/**
	 * Adds a process trace to the scheduler
	 * @param list
	 */
	public abstract void addProcessTrace(ProcessTrace process);
	/**
	 * Removes process from scheduler
	 * @param p
	 */
	public abstract void removeProcess(ProcessTrace p);
	/**
	 * Called when p's quatum has expired
	 * @param p
	 */
	public abstract void quantumExpired(ProcessTrace p);
	/**
	 * Called when p ublocks
	 * @param p
	 */
	public abstract void unblocked(ProcessTrace p);
	/**
	 * Called when p blocked on sleep;
	 * @param p
	 */
	public abstract void blockedOnSleep(ProcessTrace p);
	/**
	 * Called when p blocked on page fault
	 * @param p
	 */
	public abstract void blockedOnPageFault(ProcessTrace p);
	/**
	 * Called when p blocked on IO
	 * @param p
	 */
	public abstract void blockedOnIO(ProcessTrace p);
	/**
	 * Returns the process that is currently scheduled to run
	 * @return
	 */
	public abstract ProcessTrace getCurrentProcess();
	/**
	 * Tells whether scheduler has processes to run
	 * @return
	 */
	public abstract boolean hasRunnableProcess();
	/**
	 * Tell whether scheduler has processes
	 * @return
	 */
	public abstract boolean hasAliveProcess();
	/**
	 * Report statistics to System.out
	 */
	public abstract void report();
}
