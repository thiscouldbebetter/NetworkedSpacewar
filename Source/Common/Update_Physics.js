
class Update_Physics
{
	constructor(bodyID, loc)
	{
		this.bodyID = bodyID;
		this.loc = loc;
	}

	// instance methods

	updateWorld(world)
	{
		var body = world.bodies[this.bodyID];
		if (body != null)
		{
			body.loc.overwriteWith(this.loc);
		}
	}

	// serialization

	static updateCode()
	{
		return "P";
	}

	deserialize(updateSerialized)
	{
		var parts = updateSerialized.split(";");

		var returnValue = new Update_Physics
		(
			parts[1],
			new Location
			(
				new Coords(parseFloat(parts[2]), parseFloat(parts[3])), // pos
				new Coords(parseFloat(parts[4]), parseFloat(parts[5])) // orientation
			)
		);

		return returnValue;
	}

	serialize()
	{
		var returnValue =
			Update_Physics.updateCode() + ";"
			+ this.bodyID + ";"
			+ this.loc.pos.x + ";" + this.loc.pos.y + ";"
			+ this.loc.orientation.x + ";" + this.loc.orientation.y;

		return returnValue;
	}
}
