/**
  * <p>Title: MazeApplication</p>
  * <p>Description: This class sets up the MazeWindow frame.</p>
  * @author Joe Gallo
  * <p>ID: 19049783</p>
  */
import javax.swing.UIManager;
import java.awt.*;

public class MazeApplication {
	boolean packFrame = false;
	
	public MazeApplication() {
		MazeWindow frame = new MazeWindow();
		
		//Validate frames that have preset sizes
		//Pack frames that have useful preferred size info, e.g. from their layout
		if (packFrame) {
			frame.pack();
		}
		else {
			frame.validate();
		}
		
		//Center the window
		Dimension screenSize = Toolkit.getDefaultToolkit().getScreenSize();
		Dimension frameSize = frame.getSize();
		if (frameSize.height > screenSize.height) {
			frameSize.height = screenSize.height;
		}
		if (frameSize.width > screenSize.width) {
			frameSize.width = screenSize.width;
		}
		frame.setLocation((screenSize.width - frameSize.width) / 2, (screenSize.height - frameSize.height) / 2);
		frame.setVisible(true);		// make the frame visible
	}
	
	/** Main method */
	public static void main(String[] args) {
		try {
			UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());	// set look and feel of frame
		}
		catch(Exception e) {
			e.printStackTrace();
		}
		new MazeApplication();
	}
}
