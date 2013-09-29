/**
 * @author Vitaliy Lvin (vlvin@cs.umass.edu)
 * Copyright 2005 University of Massachusetts - Amherst
 */

import java.util.HashSet;
import java.util.Hashtable;
import java.util.Map;
import java.util.Set;
/**
 * Very simple virtual memory manager that keeps exactly one
 * page in memory at any given time.
 */
public class SimpleVMManager extends AbstractVMManager {
	/**
	 * Page currently available
	 */
	private long page = 0;
	/**
	 *Total number of page faults
	 */
	private long pageFaults = 0;
	/**
	 * Total number of page swaps
	 */
	private long pageSwaps = 0;
	/**
	 * Number of hits
	 */
	private long hits = 0; 
	
	/**
	 * List of pages requested from disk, per track
	 */
	private Map<Long, Set<Long>> requests = new Hashtable<Long, Set<Long>>();
	
	/**
	 * Attempts to read from a virtual page
	 * @param p process that requested an operation
	 * @param virtualAddress number of the virtual space
	 * @return PAGE_FAULT if page is not in memory, SUCCESS otherwise
	 */ 
	public int read(long virtualAddress) {
		if (virtualAddress == page) {
			hits++;
			return SUCCESS;
		}
		
		pageFaults++;
		Long track = new Long(translatePageAddressToDiskTrack(virtualAddress));
		if (requests.containsKey(track)) {
			Set<Long> pages = requests.get(track);
			pages.add(new Long(virtualAddress));
		}
		else {
			Set<Long> pages = new HashSet<Long>();
			pages.add(new Long(virtualAddress));
			requests.put(track, pages);
		}
		return PAGE_FAULT;
	}
	/**
	 * Attempts to write to a virtual page
	 * @param p process that requested an operation
	 * @param virtualAddress number of the virtual space
	 * @return PAGE_FAULT if page is not in memory, SUCCESS otherwise
	 */ 
	public int write(long virtualAddress) {
		if (virtualAddress == page)
			return SUCCESS;
		
		pageFaults++;
		Long track = new Long(translatePageAddressToDiskTrack(virtualAddress));
		if (requests.containsKey(track)) {
			Set<Long> pages = requests.get(track);
			pages.add(new Long(virtualAddress));
		}
		else {
			Set<Long> pages = new HashSet<Long>();
			pages.add(new Long(virtualAddress));
			requests.put(track, pages);
		}
		return PAGE_FAULT;
	}
	
	/**
	 * Notifies the manager that a certain disk request was fulfilled
	 * @param scheduler CPU scheduler
	 * @param request disk request that was fulfilled 
	 */
	public void wakeUp(AbstractCPUScheduler scheduler, DiskRequest request) {
		Long track = new Long(request.getTrack());
		if (requests.containsKey(track)) {
			Set<Long> pages = requests.get(track);
			//if more then 1 page was read from disk, take only the 1st.
			Long temp = pages.iterator().next();
			page = temp.longValue();
			pages.remove(temp);
			pageSwaps++;
		}
		
	}
	
	/**
	 * Translates between virtual memory pages and tracks on disk
	 * @param page page number
	 * @return track number
	 */
	public long translatePageAddressToDiskTrack(long page) {
		return page / 10;
	}
	
	/**
	 * Repors statistics of virtual memory usage
	 */
	public void report() {
		System.out.println("Total number of page hits: " + hits);
		System.out.println("Total number of page faults: " + pageFaults);
		System.out.println("Total number of page swaps: " + pageSwaps);
	}
}
