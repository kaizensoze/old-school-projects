/**
  * <p>Title: Location</p>
  * <p>Description: This class represents the location of anything that makes up a 2D array.</p>
  * @author Joe Gallo
  * <p>ID: 19049783</p>
  */
public class Location {
	private int row;
	private int col;
	
	/** empty constructor used to create a location 
	  * object with unspecified row, col values
	  */
	public Location() {
		row = 0;
		col = 0;
	}
	
	public Location(int y, int x) {
		row = y;
		col = x;
	}
	
	// returns the row
	public int getRow() {
		return row;
	}
	
	// returns the column
	public int getCol() {
		return col;
	}

	// sets the row to the given value
	public void setRow(int y) {
		row = y;
	}
	
	// sets the column to the given value
	public void setCol(int x) {
		col = x;
	}
	
	// sets the row and column to those of the given location object
	public void setTo(Location loc) {
		setRow(loc.getRow());
		setCol(loc.getCol());
	}
	
	// tests if the row and column are the same as those of the given Location
	public boolean equals(Location loc) {
		boolean equal = false;
		if (((Location)loc).getRow() == row && ((Location)loc).getCol() == col) {
			equal = true;
		}
		return equal;
	}
	
	// returns the *coordinates of the location
	// *in (row, col) form
	public String toString() {
		String result = "";
		result += "("+row+", "+col+")";
		return result;
	}
}
