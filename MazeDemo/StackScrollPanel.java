/**
  * <p>Title: StackScrollPanel</p>
  * <p>Description: This is the entire viewing area of a stack "illustration"</p>
  * @author Joe Gallo
  * <p>ID: 19049783</p>
  */
import java.awt.*;
import javax.swing.*;

public class StackScrollPanel extends JPanel {
	private JList stackList;					// list that holds the coordinates of the locations in the stack	
												// in (row, col) format
	private DefaultListModel listModel;			// handles data in the list
	private JScrollPane stackScroll;			// the scroll pane that contains the JList as the viewing area
		
	public StackScrollPanel() {
		super(new BorderLayout());
		listModel = new DefaultListModel();
		
		stackList = new JList(listModel);
		stackList.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);	// only one list item can be selected at a time
		stackList.setSelectedIndex(0);										
		stackList.ensureIndexIsVisible(0);
		stackList.setFixedCellWidth(65);									// set width of list
		stackList.setSelectionForeground(Color.red);						// distinguish top location on stack from others
		stackList.setSelectionBackground(Color.white);
		
		stackScroll = new JScrollPane(stackList);
		stackScroll.setWheelScrollingEnabled(true);							// you can use your mouse wheel to scroll
		stackScroll.setHorizontalScrollBarPolicy(JScrollPane.HORIZONTAL_SCROLLBAR_NEVER);

		add(stackScroll, BorderLayout.CENTER);
	}
	
	//Task: add a Location list item to the list at index 1 since index 0 is a string
	public void push(Location loc) {
		String coords = ((Location)loc).toString();
		listModel.add(1, coords);
		stackList.setSelectedIndex(1);			// highlight the location at the top of the list
	}
	
	//Task: add the Bottom and Top labels of the stack to help out the user
	public void push(String str) {
		listModel.add(0, str);
		stackList.setSelectedIndex(0);
	}
	
	//Task: remove list item from top of stack, which is at index 1
	public void pop() {
		listModel.remove(1);
		stackList.setSelectedIndex(1);				// highlight the new location at the top of the stack
	}
	
	//Task: remove all the list items in the JList
	public void clear() {
		listModel.clear();
	}
}
