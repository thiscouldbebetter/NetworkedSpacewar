
function Update_Actions(bodyID, actionNames)
{
	this.bodyID = bodyID;
	this.actionNames = actionNames;
}

{
	// methods
	
	Update_Actions.prototype.updateWorld = function(world)
	{
		var body = world.bodies[this.bodyID];

		if (body != null)
		{
			body.ticksSinceActionPerformed = 0;
			body.activity.actionNames.length = 0;
			body.activity.actionNames.append(this.actionNames);
		}
	}
	
	// serialization
	
	Update_Actions.UpdateCode = "A";
	
	Update_Actions.prototype.deserialize = function(updateSerialized)
	{
		var parts = updateSerialized.split(";");
		
		var returnValue = new Update_Actions
		(
			parts[1], // bodyID
			parts.slice(2) // actionNames
		);
		
		return returnValue
	}
	
	Update_Actions.prototype.serialize = function()
	{
		var returnValue = 
			Update_Actions.UpdateCode + ";"
			+ this.bodyID + ";"
			+ this.actionNames.join(";");
			
		return returnValue;
	}
}
