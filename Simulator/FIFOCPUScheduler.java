/**
 * @author Vitaliy Lvin (vlvin@cs.umass.edu)
 * Copyright 2005 University of Massachusetts - Amherst
 */

import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

/**
 * FIFO CPU schedulig policy
 */
public class FIFOCPUScheduler extends AbstractCPUScheduler {
		/**
		 * List of runnable processes
		 */
		private Queue<ProcessTrace> queue = new LinkedList<ProcessTrace>();
		/**
		 * List of blocked processes
		 */
		private List<ProcessTrace> blocked = new ArrayList<ProcessTrace>();
		/**
		 * 
		 */
		private long blockedOnIO = 0;
		private long blockedOnSleep = 0;
		private long blockedOnPageFault = 0;
		private long blockedOnQuantumExpiration = 0;
		private long unblocked = 0;
		private int processes = 0;
	
		/**
		 * Adds a collection of processes to the scheduler
		 */
		public void addProcessTraces(Collection<ProcessTrace> list) {
			queue.addAll(list);
			processes += list.size();
		}
		/**
		 * Adds a process trace to the scheduler
		 * @param list
		 */
		public void addProcessTrace(ProcessTrace process) {
			queue.add(process);
			processes++;
		}
		/**
		 * Removes process from scheduler
		 * @param p
		 */
		public void removeProcess(ProcessTrace p) {
			queue.remove(p);
			blocked.remove(p);
		}
		/**
		 * Called when p's quantum has expired
		 * @param p
		 */
		public void quantumExpired(ProcessTrace p) {
			queue.remove(p);
			queue.add(p);
			blockedOnQuantumExpiration++;
		}
		/**
		 * Called when p ublocks
		 * @param p
		 */
		public void unblocked(ProcessTrace p) {
			blocked.remove(p);
			queue.add(p);
			unblocked++;
		}
		/**
		 * Called when p blocked on sleep;
		 * @param p
		 */
		public void blockedOnSleep(ProcessTrace p) {
			queue.remove(p);
			blocked.add(p);
			blockedOnSleep++;
		}
		/**
		 * Called when p blocked on page fault
		 * @param p
		 */
		public void blockedOnPageFault(ProcessTrace p) {
			queue.remove(p);
			blocked.add(p);
			blockedOnPageFault++;
		}
		/**
		 * Called when p blocked on IO
		 * @param p
		 */
		public void blockedOnIO(ProcessTrace p) {
			queue.remove(p);
			blocked.add(p);
			blockedOnIO++;
		}
		/**
		 * Returns the process that is currently scheduled to run
		 * @return
		 */
		public ProcessTrace getCurrentProcess() {
			return queue.peek();
		}
		/**
		 * Tells whether scheduler has processes to run
		 * @return
		 */
		public boolean hasRunnableProcess() {
			return queue.size() > 0;
		}
		/**
		 * Tell whether scheduler has processes
		 * @return
		 */
		public boolean hasAliveProcess() {
			return (queue.size() > 0) || (blocked.size() > 0);
		}
		/**
		 * Reports statistics
		 */
		public void report() {
			System.out.println("Total number of processes: " + processes);
			System.out.println("Number of blocks on I/O: " + blockedOnIO);
			System.out.println("Number of blocks on sleep: " + blockedOnSleep);
			System.out.println("Number of blocks on page fault: " + blockedOnPageFault);
			System.out.println("Quanta expired: " + blockedOnQuantumExpiration);
		}
}


