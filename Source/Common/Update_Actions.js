
class Update_Actions
{
	constructor(bodyID, actionNames)
	{
		this.bodyID = bodyID;
		this.actionNames = actionNames;
	}

	// methods

	updateWorld(world)
	{
		var body = world.bodies[this.bodyID];

		if (body != null)
		{
			body.ticksSinceActionPerformed = 0;
			body.activity.actionNames.length = 0;
			body.activity.actionNames.push(...this.actionNames);
		}
	}

	// serialization

	static updateCode()
	{
		return "A";
	}

	deserialize(updateSerialized)
	{
		var parts = updateSerialized.split(";");

		var returnValue = new Update_Actions
		(
			parts[1], // bodyID
			parts.slice(2) // actionNames
		);

		return returnValue
	}

	serialize()
	{
		var returnValue =
			Update_Actions.updateCode() + ";"
			+ this.bodyID + ";"
			+ this.actionNames.join(";");

		return returnValue;
	}
}
