
class Update_Physics
{
	constructor(bodyId, loc)
	{
		this.bodyId = bodyId;
		this.loc = loc;
	}

	// instance methods

	updateWorld(world)
	{
		var body = world.bodiesByName.get(this.bodyId);
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

		var pos = new Coords
		(
			parseFloat(parts[2]), parseFloat(parts[3])
		);

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
		var forwardInTurns = NumberHelper.roundToDecimalPlaces
		(
			forward.headingInTurns(), 2
		);

		var posX = NumberHelper.roundToDecimalPlaces(pos.x, 1);
		var posY = NumberHelper.roundToDecimalPlaces(pos.y, 1);

		var returnValue =
			Update_Physics.updateCode() + ";"
			+ this.bodyId + ";"
			+ posX + ";" + posY + ";"
			+ forwardInTurns

		return returnValue;
	}
}
