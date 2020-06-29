
function Update_Physics(bodyID, loc)
{
	this.bodyID = bodyID;
	this.loc = loc;
}

{
	// instance methods

	Update_Physics.prototype.updateWorld = function(world)
	{
		var body = world.bodies[this.bodyID];
		if (body != null)
		{
			body.loc.overwriteWith(this.loc);
		}
	};

	// serialization

	Update_Physics.UpdateCode = "P";

	Update_Physics.prototype.deserialize = function(updateSerialized)
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
	};

	Update_Physics.prototype.serialize = function()
	{
		var returnValue =
			Update_Physics.UpdateCode + ";"
			+ this.bodyID + ";"
			+ this.loc.pos.x + ";" + this.loc.pos.y + ";"
			+ this.loc.orientation.x + ";" + this.loc.orientation.y;

		return returnValue;
	};
}
