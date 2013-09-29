/**
  * <p>Title: MazeWindow</p>
  * <p>Description: This is the frame consisting of the control panel, maze, and stack display.</p>
  * @author Joe Gallo
  * <p>ID: 19049783</p>
  */
import java.awt.*;
import java.awt.event.*;
import java.util.*;
import javax.swing.*;
import javax.swing.event.*;

public class MazeWindow extends JFrame {
	protected JPanel contentPane;
	protected JPanel controlPanel = new JPanel();				// JPanel for control panel
	
    protected JPanel speedPanel = new JPanel();					// contains JSliders for adjusting pause amount
	protected JPanel createPanel = new JPanel();				// contains createSlider and its label
	protected JPanel solvePanel = new JPanel();					// contains solveSlider and its label
	protected JLabel createSpeed = new JLabel("create pause");	// label for the createSlider
	protected JLabel solveSpeed = new JLabel("solve pause");	// label for the solveSlider
	
	protected BorderLayout borderLayout = new BorderLayout();	
	protected JButton create = new JButton("Create");			// button to create a maze
	protected JButton solve = new JButton("Solve");				// button to traverse a maze
	protected JButton stop = new JButton("Stop");				// button to stop maze
	
	
	/** The viewing area for the graphical stack */
	protected StackScrollPanel stack = new StackScrollPanel();	
	/** The maze */
	protected MazePanel maze = new MazePanel(stack);					// initialize the maze object
	
	protected volatile Thread t;										// thread used for create and solve processes

	
	JSlider createSlider = new JSlider(JSlider.HORIZONTAL,1,50,15);		// used to adjust pause amount for creating maze
	JSlider solveSlider = new JSlider(JSlider.HORIZONTAL,1,50,15);		// used to adjust pause amount for solving maze
																		// both have range 50 and are set at 25 by default
																		
	int createP = 23;													// scalar that multiplies current value of either JSlider
	int solveP = 23;
	
	public MazeWindow() {
		enableEvents(AWTEvent.WINDOW_EVENT_MASK); 						// Enables the events defined by the specified event 
																		// mask parameter to be delivered to this component
																		// This method only needs to be invoked by subclasses
																		// of Component which desire to have the specified event 
																		// types delivered to processEvent regardless of whether 
																		// or not a listener is registered.
																		
	    this.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);			// program will exit when X'ed out
		try {
			setup();
		}
		catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	/**--------------------------------------------------- Set Up Frame ----------------------------------------------------*/
	
	private void setup() {
		contentPane = (JPanel) this.getContentPane();	
		contentPane.setLayout(borderLayout);				// set the layout for the content pane
		this.setSize(new Dimension(700,700));				// set the size of the frame
		this.setTitle("Maze Demo");							// give the frame a title
		
		create.addActionListener(new ActionListener() {		// add action listener for the create button
			public void actionPerformed(ActionEvent e) {
				createAction(e);
			}
		});
		
		solve.addActionListener(new ActionListener() {		// add action listener for the solve button
			public void actionPerformed(ActionEvent e) {
				solveAction(e);
			}
		});
		
		stop.addActionListener(new ActionListener() {		// add action listener for the stop button
			public void actionPerformed(ActionEvent e) {
				stopAction(e);
			}
		});
		
		createSlider.addChangeListener(new CreateSliderListener());			// add change listener for create slider
		createSlider.setMajorTickSpacing(10);
		createSlider.setMinorTickSpacing(1);
		createSlider.setPaintTicks(true);
		createSlider.setPaintLabels(true);
		createSlider.setSnapToTicks(true);
		MazePanel.CREATE_PAUSE = createP * (createSlider.getValue());		// although the slider has a value of 25 to begin with,
																			// the create pause amount needs to be initialized in
																			// the MazePanel class, where all maze processes occur
		
		solveSlider.addChangeListener(new SolveSliderListener());			// add change listener for solve slider
		solveSlider.setMajorTickSpacing(10);
		solveSlider.setMinorTickSpacing(1);
		solveSlider.setPaintTicks(true);
		solveSlider.setPaintLabels(true);
		solveSlider.setSnapToTicks(true);
		MazePanel.SOLVE_PAUSE = solveP * (solveSlider.getValue());				// initializes solve pause amount
		
		createPanel.setLayout(new BoxLayout(createPanel, BoxLayout.Y_AXIS));	// set layout of panel containing create slider and
																				// its label
		createPanel.setPreferredSize(new Dimension(200,60));					
		solvePanel.setLayout(new BoxLayout(solvePanel, BoxLayout.Y_AXIS));		// set layout of panel containing solve slider and 
																				// its label
		solvePanel.setPreferredSize(new Dimension(200,60));
		createPanel.add(createSpeed);											// create components are added to create panel
		createPanel.add(createSlider);		
		solvePanel.add(solveSpeed);												// solve components are added to solve panel
		solvePanel.add(solveSlider);
		
		speedPanel.add(createPanel);											// the create and solve panels come together to
																				// form the entire speed panel
		speedPanel.add(solvePanel);
						
		controlPanel.add(create);												// add buttons to the control panel
		controlPanel.add(solve);
		controlPanel.add(stop);
		controlPanel.add(speedPanel);
	
		controlPanel.setBorder(BorderFactory.createLineBorder(Color.black));	// add a black border around the control panel
		
		contentPane.add(maze, BorderLayout.CENTER);								// maze is positioned in CENTER section of frame
																				// and maze has all walls up
		contentPane.add(controlPanel, BorderLayout.SOUTH);						// control panel is put at bottom of frame
		contentPane.add(stack, BorderLayout.EAST);								// stack panel is to the right

		solve.setEnabled(false);												// the only thing to do is create the maze so
		stop.setEnabled(false);													// stop and solve buttons are deactivated
	}
	
	
	/**---------------------------------------------- Action Listeners for Buttons -----------------------------------*/
	
	
	/** creates new maze */
	protected void createAction(ActionEvent e) {								
		create.setEnabled(false);									// button config when create button pressed
		stop.setEnabled(true);													
																				
		solve.setEnabled(false);												
		stack.clear();												// clear stack window
		stack.push("Bottom");										// set up stack window
		stack.push("Top");
		
		t = new Thread(maze) {
			public void run() {
				maze.create();
				stop.setEnabled(false);								// button config once create process complete
				solve.setEnabled(true);
				create.setEnabled(true);
			}
		};
		t.start();											
	}	
	
	/** solves maze */
	protected void solveAction(ActionEvent e) {
		create.setEnabled(false);									// button config once solve button pressed
		stop.setEnabled(true);
		solve.setEnabled(false);
		stack.clear();												// clear stack window
		stack.push("Bottom");										// set up stack window
		stack.push("Top");
		
	
		t = new Thread(maze) {
			public void run() {
				maze.solve();
				create.setEnabled(true);							// button config once solve process complete
				stop.setEnabled(false);
				solve.setEnabled(false);
			}
		};
		t.start();
	}
	
	/** stops create/solve process */
	protected synchronized void stopAction(ActionEvent e) {
		if (stop.isEnabled()) {
			stop.setEnabled(false);
			t.stop();												// this method is not "proper"
			create.setEnabled(true);								// the app. crashes every now and then
			solve.setEnabled(false);								// i was unable to stop a process the "proper" way, ie,
		}															// setting a volatile boolean to false the the run() method
	}																// normally depends on for being true
	
	
	/**------------------------------------------ Change Listeners for Sliders -------------------------------------*/
	
	
	/** Sense if the value of the slider is changing.
	  * If it is, get the value and change the pause amount
	  * for the creation process accordingly. This will only affect
	  * the maze creation process.
	  */
	private class CreateSliderListener implements ChangeListener {
		public void stateChanged(ChangeEvent e) {
			JSlider source = (JSlider)e.getSource();
			if (!source.getValueIsAdjusting()) {					
				int val = (int)source.getValue();					
				MazePanel.CREATE_PAUSE = createP * val;					// createP is just a random int chosen that seems to work
			}															// with the range of the slider
		}
	}
	
	/** Sense if the value of the slider is changing.
	  * If it is, get the value and change the pause amount
	  * for the traversal process accordingly. This will only affect
	  * the maze traversal process.
	  */
	private class SolveSliderListener implements ChangeListener {
		public void stateChanged(ChangeEvent e) {
			JSlider source = (JSlider)e.getSource();
			if (!source.getValueIsAdjusting()) {
				int val = (int)source.getValue();
				MazePanel.SOLVE_PAUSE = solveP * val;					// solveP is just a random int chosen that seems to work
			}															// with the range of the slider
		}
	}
}
