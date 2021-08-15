
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
		var body = world.bodiesByName.get(this.bodyID);
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

		var bodyId = parts[1];

		// To save bandwidth, round the pos to the nearest pixel,
		// because the display will anyway.
		var pos = new Coords
		(
			parseFloat(parts[2]), parseFloat(parts[3])
		).roundToDecimalPlaces(0);

		var headingInTurns = parseFloat(parts[4]);

		var returnValue = new Update_Physics
		(
			bodyId,
			new Location
			(
				pos,
				headingInTurns
			)
		);

		return returnValue;
	}

	serialize()
	{
		var pos = this.loc.pos;
		var forward = this.loc.orientation.forward;
		var forwardInTurns = forward.headingInTurns();

		var returnValue =
			Update_Physics.updateCode() + ";"
			+ this.bodyID + ";"
			+ pos.x + ";" + pos.y + ";"
			+ forwardInTurns

		return returnValue;
	}
}
