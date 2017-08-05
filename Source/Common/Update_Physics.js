
function Update_Physics(bodyID, pos, orientation)
{
	this.bodyID = bodyID;
	this.pos = pos;
	this.orientation = orientation;
}

{	
	// instance methods

	Update_Physics.prototype.updateWorld = function(world)
	{
		var body = world.bodies[this.bodyID];
		if (body != null)
		{
			body.pos.overwriteWith(this.pos);
			body.orientation.overwriteWith(this.orientation);
			body.right.overwriteWith(this.orientation).right();
		}
	}
	
	// serialization

	Update_Physics.UpdateCode = "P";
	
	Update_Physics.prototype.deserialize = function(updateSerialized)
	{
		var parts = updateSerialized.split(";");
		
		var returnValue = new Update_Physics
		(
			parts[1],
			new Coords(parseFloat(parts[2]), parseFloat(parts[3])), // pos
			new Coords(parseFloat(parts[4]), parseFloat(parts[5])) // orientation
		);
		
		return returnValue;
	}
	
	Update_Physics.prototype.serialize = function()
	{
		var returnValue = 
			Update_Physics.UpdateCode + ";"
			+ this.bodyID + ";"
			+ this.pos.x + ";" + this.pos.y + ";"
			+ this.orientation.x + ";" + this.orientation.y;
			
		return returnValue;
	}
}
