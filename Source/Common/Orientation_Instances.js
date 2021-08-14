class Orientation_Instances {
	constructor() {
		this.ForwardXDownZ = new Orientation(new Coords(1, 0, 0), // forward
		new Coords(0, 0, 1) // down
		);
		this.ForwardZDownY = new Orientation(new Coords(0, 0, 1), // forward
		new Coords(0, 1, 0) // down
		);
	}
}
