import java.io.*;
import java.util.*;

public class Simulator {
	
	private static final int QUANTUM = 100;
	
	private static final int DISK_ACCESS_TIME = 100;
	
	private AbstractCPUScheduler cpuScheduler;
	private AbstractVMManager memoryManager;
	private AbstractDiskScheduler diskScheduler;
	
	private int numberOfInstructions;
	
	public Simulator(String classFile, Collection<String> processFiles) {
		loadDynamicClasses(classFile);
		addProcessTraces(processFiles);
		numberOfInstructions = 0;
		initialize();
		report();
		System.exit(0);
	}
	/**
	* Loads CPU scheduler, memory manager and disk scheduler classes
	* whose names are listed in a file
	* @param filename Files where class names are listed
	*/
	private void loadDynamicClasses(String filename) {
		//check file existence
		//can't run without this file, so halt if the file not there
		File f = new File(filename);
		if (!f.exists()) {
			System.out.println("File " + filename + " does not exist!");
			System.exit(1);
		}
		
		String CPUSchedulerName = null;
		String VMManagerName = null;
		String DiskSchedulerName = null;
		
		//try reading class names from the file
		//can't work without class names, so halt on failure
		try {
			BufferedReader reader = new BufferedReader(new FileReader(f));
			CPUSchedulerName = reader.readLine();
			VMManagerName = reader.readLine();
			DiskSchedulerName = reader.readLine();
			reader.close();
		}
		catch (IOException e) {
			System.out.println("Cannot read file " + filename + ".");
			System.exit(1);
		}
		
		//try loading classes
		//can't proceed without them, so halt on failure
		ClassLoader cl = ClassLoader.getSystemClassLoader();
		try {
			Class c = cl.loadClass(CPUSchedulerName);
			cpuScheduler = (AbstractCPUScheduler)c.newInstance();
			c = cl.loadClass(VMManagerName);
			memoryManager = (AbstractVMManager)c.newInstance();
			c = cl.loadClass(DiskSchedulerName);
			diskScheduler = (AbstractDiskScheduler)c.newInstance();
		}
		catch (Exception e) {
			System.out.println(e.getMessage());
			System.exit(1);
		}
	}
	
	private void addProcessTraces(Collection<String> processFiles) {
		ProcessTrace process;
		for (String a : processFiles) {
			process = new ProcessTrace(a);
			cpuScheduler.addProcessTrace(process);
		}
	}

	public void initialize() {
		InstructionBlock currentInstruction;
		DiskRequest diskreq;
		ProcessTrace currentProcess;
		long data;
		int quantum = 0;
		
		while (cpuScheduler.hasAliveProcess()) {
			currentProcess = cpuScheduler.getCurrentProcess();
			currentInstruction = currentProcess.getNextInstructionBlock();
			data = currentInstruction.getData();
			
			if (cpuScheduler.hasRunnableProcess()) {
				switch (currentInstruction.getInstructionCode()) {
				
					case InstructionBlock.EXECUTE:
					case InstructionBlock.READ: 
						if (memoryManager.read(data) != AbstractVMManager.SUCCESS) {
							diskreq = new DiskRequest(currentProcess, memoryManager.translatePageAddressToDiskTrack(data));
							diskScheduler.addRequest(diskreq);
							diskreq.addProcess(memoryManager);
							quantum = 0;
							cpuScheduler.blockedOnPageFault(currentProcess);
						}
						quantum++;
						break;
						
					case InstructionBlock.WRITE:
						if (memoryManager.read(data) != AbstractVMManager.SUCCESS) {
							diskreq = new DiskRequest(currentProcess, memoryManager.translatePageAddressToDiskTrack(data));
							diskScheduler.addRequest(diskreq);
							diskreq.addProcess(memoryManager);
							quantum = 0;
							cpuScheduler.blockedOnPageFault(currentProcess);
						}
						quantum++;
						break;
						
					case InstructionBlock.FILE_OPEN:
					case InstructionBlock.FILE_CLOSE:
					case InstructionBlock.FILE_READ:
					case InstructionBlock.FILE_WRITE:
						diskreq = new DiskRequest(currentProcess, data);
						diskScheduler.addRequest(diskreq);
						cpuScheduler.blockedOnIO(currentProcess);
						quantum = 0;
						break;
						
					case InstructionBlock.SLEEP:
						cpuScheduler.blockedOnSleep(currentProcess);
						quantum = 0;
						break;
				}
				currentInstruction.executeOnce();
				numberOfInstructions++;
			}
			if (quantum >= QUANTUM) {
				cpuScheduler.quantumExpired(currentProcess);
				quantum = 0;
			}
			
			
		}
	}
	
	private void report() {
		cpuScheduler.report();
		memoryManager.report();
		diskScheduler.report();
		System.out.println("Total time elapsed: " + numberOfInstructions + ".");
	}

	public static void main(String[] args) {
		Vector<String> argsList = new Vector<String>();
		for (int i = 1; i < args.length; i++) {
			argsList.add(args[i]);
		}
		Simulator sim = new Simulator(args[0], argsList);
	}
}