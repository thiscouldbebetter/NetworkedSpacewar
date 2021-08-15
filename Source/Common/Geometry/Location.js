
class Location
{
	constructor(pos, forwardInTurns)
	{
		this.pos = pos || Coords.zeroes();

		var forwardAsPolar = new Polar(forwardInTurns, 1);
		var forwardAsCoords = forwardAsPolar.toCoords(Coords.create());
		this.orientation = Orientation.fromForward(forwardAsCoords);
	}

	clone()
	{
		return new Location
		(
			this.pos.clone(), this.orientation.forward.headingInTurns()
		);
	}

	overwriteWith(other)
	{
		this.pos.overwriteWith(other.pos);
		this.orientation.overwriteWith(other.orientation);
		return this;
	}
}
