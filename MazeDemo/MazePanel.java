/**
  * <p>Title: MazePanel</p>
  * <p>Description: This is a JPanel that contains a maze.</p>
  * @author Joe Gallo
  * <p>ID: 19049783</p>
  */
import java.awt.*;
import java.util.*;
import javax.swing.*;

public class MazePanel extends JPanel implements CardinalDirections, Runnable {
	final static int backgroundCode = 0;	// code for background of maze
	final static int wallCode = 1;			// code for wall cell of maze
    final static int pathCode = 2;			// code for maze cell in current path
    final static int emptyCode = 3;			// code for maze cell not yet touched
    final static int visitedCode = 4;		// code for maze cell touched, but not part of path
	final static int startCode = 5;			// code for starting position
	final static int goalCode = 6; 			// code for goal position
	
	/** array of designated colors used in maze */
	protected Color[] color = {Color.lightGray, Color.black, Color.yellow, new Color(128,128,255),
								Color.gray, Color.green, Color.red};
	
	protected StackScrollPanel stackPanel;							// viewing area of stack from MazeWindow
	protected Stack locStack;										// stack of locations
	
	protected StringBuffer walledNeighbors = new StringBuffer("");	// string representing existing neighbors surrounded by walls
	protected StringBuffer allowedDir = new StringBuffer("");		// string representing available directions from current location
	protected int currDir;											// current direction of whatever is traversing the maze
	
	protected int width = 533;			// width of maze
	protected int height = 533;			// height of maze
	protected int top = 24;				// top of maze
	protected int left = 50;			// left side of maze
	
	protected int i,j;					// vars. used for for loops and whatnot
	protected int rows = 41;			// # of rows in maze, including wall border
	protected int cols = 41;			// # of cols in maze, including wall border
	
	protected Location start;			// start location of maze
	protected Location goal;			// goal location of maze
	/**
	  * current location in maze, preset to one cell north of start location
	  */
	protected Location currLoc = new Location();	
	
	protected int cellWidth = width / cols;					// width of maze cell
	protected int cellHeight = height / rows;				// height of maze cell
	protected int totalRooms = (rows / 2) * (cols / 2);		// count of empty rooms 
	
	/** 
	  * array that keeps track of positions of empty rooms
	  */
	protected Location[] rooms;
	
	protected long PAUSE;
	public static long CREATE_PAUSE;					// length of pause after each step of creation process
	public static long SOLVE_PAUSE;						// length of pause after each step of solve process
	
	/**
	  * double array of integers pertaining to 
	  * the color/state of each cell in the maze
	  */
	protected int[][] maze;
	
	public MazePanel(StackScrollPanel stack) {
		super();
		setSize(new Dimension(width,height));			// set size of painting space of maze
		setBackground(color[backgroundCode]);			// set background color of painting space
		setup();										// maze object initialized, starting with all walls up	
		stackPanel = stack;								// get the stackPanel from the MazeWindow
	}
	
	public void paintComponent(Graphics g) {			// all painting methods are done in here
		super.paintComponent(g);
		draw(g);
		
	}
	
	public void update(Graphics g) {
		paintComponent(g);
	}
	
	// set up the maze
	public void setup() {
		if (maze == null) {
			maze = new int[rows][cols];
		}
		
		for (i = 0; i < rows; i++) {		// start with everything being a wall
			for (j = 0; j < cols; j++) {
				maze[i][j] = wallCode;
			}
		}
		int roomsPos = 0;							// position of rooms array
		rooms = new Location[totalRooms];
		for (i = 1; i < rows-1; i += 2) {			// make grid of empty rooms
			for (j = 1; j < cols-1; j += 2) {
				maze[i][j] = emptyCode;				// mark room as empty
				rooms[roomsPos] = new Location();
				rooms[roomsPos].setRow(i);			// store row of empty room 
				rooms[roomsPos].setCol(j);			// store col of empty room
				roomsPos++;
             }
		}
	}
	
	public synchronized void draw(Graphics g) {
		g.setColor(color[backgroundCode]);
		g.fillRect(left,top,width,height);			// draw white background the size of maze
		if (maze != null) {
			/**
			  * if there was an option to change the size of the maze,
			  * which i didn't get a chance to do, the next two lines would
			  * check the size of the cells to be drawn
			  */
			cellWidth = width / cols;
			cellHeight = height / rows;
			for (int i = 0; i < rows; i++) {
				for (int j = 0; j < cols; j++) {
					if (maze[i][j] == emptyCode) {
						g.setColor(color[emptyCode]);
					}
					else {
						g.setColor(color[maze[i][j]]);
					}
					/** 
					  * top and left vars. are here so that, if i were to add flexibility to this program,
					  * the maze could easily be shifted
					  */
					g.fillRect( ((j * cellWidth) + left), ((i * cellHeight) + top), cellWidth, cellHeight);
				}
			}
		}
	}
	
	// create the maze
	public void create() {
		setup();											// reset maze to default state (all walls up)
		locStack = new Stack();								// initialize stack
		int visitedRooms = 1;
		char neighborChoice;
		Location neighbor = new Location();
		Random r = new Random();
		currLoc.setTo(rooms[r.nextInt(rooms.length)]);						// pick random room to start at
		
		while (visitedRooms < totalRooms) {									// while we have not visited all the rooms
			if (hasWalledNeighbor(currLoc.getRow(), currLoc.getCol())) {	// if it has nearby rooms that's surrounded by walls,
				StringBuffer neighborCount = getWalledNeighbors();			// randomly pick one and knock down the wall inbetween
				neighborChoice = neighborCount.charAt(r.nextInt(neighborCount.length()));

				switch (neighborChoice) {
					case 'n':
						neighbor = new Location(currLoc.getRow()-2, currLoc.getCol());
						tearDown(currLoc.getRow()-1, currLoc.getCol());
						break;
					case 'e':
						neighbor = new Location(currLoc.getRow(), currLoc.getCol()+2);
						tearDown(currLoc.getRow(), currLoc.getCol()+1);
						break;
					case 's':
						neighbor = new Location(currLoc.getRow()+2, currLoc.getCol());
						tearDown(currLoc.getRow()+1, currLoc.getCol());
						break;
					case 'w':
						neighbor = new Location(currLoc.getRow(), currLoc.getCol() - 2);
						tearDown(currLoc.getRow(), currLoc.getCol()-1);
						break;
					default:
						break;
				}
				currLoc.setTo(neighbor);													// set the new current position to the
				visitedRooms++;																// spot of the former neighbor
			}
			else {
				currLoc.setTo((Location)locStack.pop());									// if no neighbors are surrounded, pop
				stackPanel.pop();															// to a neighbor that is
			}
		}
		start = new Location(1,1);															// set start location
		goal = new Location(rows-2,cols-2);													// set goal location
		maze[1][1] = startCode;
		maze[rows-2][cols-2] = goalCode;
		repaint();
    }
	
	public void solve() {
		// set current location cell north of start location
		currLoc.setRow(start.getRow()-1);		
		currLoc.setCol(start.getCol());			
		locStack = new Stack();		// initialize stack of locations	
		currDir = SOUTH;
		step(currLoc, currDir);		// step into the maze at the start location
	    
		while (true) {
			if (atGoal()) {			// we found solution so we're done
				return;
			}
			// see which adjacent cells are available
			getAllowed(currLoc.getRow(), currLoc.getCol());
			int numDir = numDirections();
			
			switch (numDir) {
				case 0: {							// if nowhere to go
					if (!locStack.empty()) {
						backtrack(currLoc);			// backtrack
					}
					break;
				}
				default: {							// if direction to go
					currDir = getDirection();
					step(currLoc, currDir);			// step
					break;
				}
			}
		}
	}
	
	//Task: tear down the wall at the given row and col of the maze
	public void tearDown(int row, int col) {
		maze[row][col] = emptyCode;
		repaint();
		locStack.push(new Location(currLoc.getRow(), currLoc.getCol()));			// push the room u moved from onto stack
		stackPanel.push(currLoc);
		try { Thread.sleep(CREATE_PAUSE); }
                catch (InterruptedException e) { }
	}
	
	// see if neighbor is an empty room, is in bounds, and if it is surrounded by walls
	// check north, east, south, and west neighbor (in that order)
	public boolean hasWalledNeighbor(int row, int col) {
		walledNeighbors.delete(0,walledNeighbors.length());
		int has = 0;
		
		if (inBounds(row-2, col) && isEmptyRoom(row-2, col) && isWalled(row-2, col)) {
			walledNeighbors.append("n");
			has++;
		}
		if (inBounds(row, col+2) && isEmptyRoom(row, col+2) && isWalled(row, col+2)) {
			walledNeighbors.append("e");
			has++;
		}
		if (inBounds(row+2, col) && isEmptyRoom(row+2, col) && isWalled(row+2, col)) {
			walledNeighbors.append("s");
			has++;
		}
		if (inBounds(row, col-2) && isEmptyRoom(row, col-2) && isWalled(row, col-2)) {
			walledNeighbors.append("w");
			has++;
		}

		return has > 0;
	}
	
	// see if a location is surrounded by walls
	// we assume the parameters are coordinates of a valid empty room
	public boolean isWalled(int row, int col) {
		boolean surrounded = false;
		
		if (maze[row-1][col] == wallCode && maze[row][col+1] == wallCode &&
				maze[row+1][col] == wallCode && maze[row][col-1] == wallCode) {
			surrounded = true;
		}
		return surrounded;
	}
	
	// see if a location is a wall
	// contains in bounds check
	public boolean isWall(int row, int col) {
		if (!inBounds(row, col)) {
			return false;
		}
		else {
			return maze[row][col] == wallCode;
		}
	}
	
	// see if a location is an empty room
	// contains in bounds check
	public boolean isEmptyRoom(int row, int col) {
		if (!inBounds(row, col)) {
			return false;
		}
		else {
			return maze[row][col] == emptyCode;
		}
	}
	
	// see if a location is the goal
	// contains in bounds check
	public boolean isGoal(int row, int col) {
		if (!inBounds(row, col)) {
			return false;
		}
		else {
			return maze[row][col] == goalCode;
		}
	}
	
	// determines if a cell is within the given size of the maze
	public boolean inBounds(int row, int col) {
		return row < rows && row >= 0 && col < cols && col >= 0;
	}
	
	//Post: stringbuffer representing directions of walled neighbors relative to current location has been returned
	public StringBuffer getWalledNeighbors() {
		return walledNeighbors;
	}	
	
	//Task: check if the current location is the goal
	public boolean atGoal() {
		return currLoc.equals(goal);
	}
	
	// check available ways to go from currLoc
	public void getAllowed(int row, int col) {
		allowedDir.delete(0, allowedDir.length());
		// check north of currLoc
		if (isEmptyRoom(row-1, col) || isGoal(row-1, col)) {
			allowedDir.append("n");
		}
		
		// check east of currLoc
		if (isEmptyRoom(row, col+1) || isGoal(row, col+1)) {
			allowedDir.append("e");
		}
	
		// check south of currLoc
		if (isEmptyRoom(row+1, col) || isGoal(row+1, col)) {
			allowedDir.append("s");
		}
		
		// check west of currLoc
		if (isEmptyRoom(row, col-1) || isGoal(row, col-1)) {
			allowedDir.append("w");
		}
	}
	
	//Post: number of directions for the traverser at current location to go in has been returned
	public int numDirections() {
		return allowedDir.length();
	}
	
	//Post: random available direction traverser at current location can take has been returned
	public int getDirection() {
		Random r = new Random();
		switch (allowedDir.charAt(r.nextInt(numDirections()))) {
			case 'n': 
				return NORTH;
			case 'e':
				return EAST;
			case 's':
				return SOUTH;
			case 'w':
				return WEST;
			default:
				return -1;
		}
	}
	
	//Post: current direction of traverser at current location has been reversed
	public void turnAround() {
		switch(currDir) {
			case NORTH:
				currDir = SOUTH;
				break;
			case EAST:
				currDir = WEST;
				break;
			case SOUTH:
				currDir = NORTH;
				break;
			case WEST:
				currDir = EAST;
				break;
			default:
				break;
		}
	}
	
	//Post: Traveler has moved over one cell from spot in direction of dir
	public void step(Location spot, int dir) { 			// spot is the same as currLoc
		int spotRow = spot.getRow();		
		int spotCol = spot.getCol();
		
		/** in the solve process, every cell that is visited is pushed right before currLoc  
		  * is set to the next cell to be visited
		  */
		if (spotRow > 0) {										// the traveler starts one cell north of start location
			locStack.push(new Location(spotRow, spotCol));		// and we don't want to push that location onto stack
			stackPanel.push(spot);	
		}
		
		switch (dir) {
			case NORTH: 
				currLoc.setRow(spotRow-1);
				currLoc.setCol(spotCol);
				break;
			case EAST:
				currLoc.setRow(spotRow);
				currLoc.setCol(spotCol+1);
				break;
			case SOUTH:
				currLoc.setRow(spotRow+1);
				currLoc.setCol(spotCol);
				break;
			case WEST:
				currLoc.setRow(spotRow);
				currLoc.setCol(spotCol-1);
				break;
			default:
				break;
		}
		int currRow = currLoc.getRow();
		int currCol = currLoc.getCol();
		
		maze[currRow][currCol] = pathCode;				// mark cell with path marker
		repaint();
		try { 
			Thread.sleep(SOLVE_PAUSE); 
		}
        catch (InterruptedException e) { }
	}
	
	//Post: Traveler has stepped back to previous location, which is at the top of the location stack
	public void backtrack(Location spot) {
		Location old = new Location();					// reference to location block at top of locStack
		old.setTo((Location)locStack.pop());
		stackPanel.pop();
		
		int spotRow = spot.getRow();		
		int spotCol = spot.getCol();
		
		maze[spotRow][spotCol] = visitedCode;			// mark cell with visited marker
		repaint();
		try { 
			Thread.sleep(SOLVE_PAUSE); 
		}
        catch (InterruptedException e) { }
		
		currLoc.setTo(old);
	}
	
	
	/**---------------------------------------------- Threading Stuff ----------------------------------------*/
	
	// overridden when thread is created
	public void run() {
		
	}
}
