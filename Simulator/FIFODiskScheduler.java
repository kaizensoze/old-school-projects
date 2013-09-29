/**
 * @author Vitaliy Lvin (vlvin@cs.umass.edu)
 * Copyright 2005 University of Massachusetts - Amherst
 */
import java.util.ArrayList;
import java.util.List;

/**
 * 
 * FIFO disk scheduler
 */
public class FIFODiskScheduler extends AbstractDiskScheduler {
	
	private long posted  = 0;
	private long completed = 0;
	
	private List<DiskRequest> queue = new ArrayList<DiskRequest>();
	
	/**
	 * Adds a request to disk scheduler queue
	 * @param r DiskRequest
	 */
	public void addRequest(DiskRequest r) {
		posted++;
		for (int i = 0; i < queue.size(); i++) {
			DiskRequest request = queue.get(i);
			if (request.getTrack() == r.getTrack()) {
				//already in the queue
				request.addProcesses(r.getProcesses());
				return;
			}
		}
		
		queue.add(r);
	}

	/**
	 * Checks whether there are any pending requests.
	 * @return true is there is at least one request pending
	 */
	public boolean hadNextRequest() {
		return !queue.isEmpty();
	}
	
	/**
	 * Returns the next request to be executed and removes it from the queue
	 * @return DiskRequest
	 */
	public DiskRequest getNextRequest() {
		if (! queue.isEmpty())
			completed++;
		return queue.remove(0);
	}
	
	/**
	 * Reports statistics
	 */
	public void report() {
		System.out.println("Number of disk request recieved: " + posted);
		System.out.println("Number of tracks read: " + completed);
	}
}
