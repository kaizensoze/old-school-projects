/**
 * @author Vitaliy Lvin (vlvin@cs.umass.edu)
 * Copyright 2005 University of Massachusetts - Amherst
 */
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;

/**
 * Container for disk requests
 */
public class DiskRequest {
	/**
	 * Disk track being requested
	 */
	private long track;
	/**
	 * List of processes (or wakeables) who want to be notifed
	 * when this request is fulfilled
	 */
	private List<Wakeable> processList = new LinkedList<Wakeable>();

	/**
	 * Creates a disk request for IO operation
	 * @param process process requesting IO
	 * @param requestedTrack track requested
	 */
	public DiskRequest(Wakeable process, long requestedTrack) {
		processList.add(process);
		track = requestedTrack;
	}
	
	/**
	 * Retrieves list of processes that want to be notified
	 * @return
	 */
	public List<Wakeable> getProcesses() {
		return processList;
	}
	
	/**
	 * Returns disk track being requested
	 * @return
	 */
	public long getTrack() {
		return track;
	}
	
	/**
	 * Adds processes to the list of those who want
	 * to be notifed of this request's completion.
	 * @param plist
	 */
	public void addProcesses(List<Wakeable> plist) {
		Iterator<Wakeable> i = plist.iterator();
		while (i.hasNext()) {
			Wakeable temp = i.next();
			if (! processList.contains(temp))
				processList.add(temp);
		}
	}
	
	/**
	 * Adds process to the list of those who wants
	 * to be notifed of this request's completion.
	 * @param plist
	 */
	public void addProcess(Wakeable p) {
		processList.add(p);
	}
	
	public boolean equals(Object o) {
		if (o instanceof DiskRequest) 
			return ((DiskRequest) o).track == this.track;
		return false;
	}
	
	public int hashCode() {
		return new Long(track).hashCode();
	}
}
