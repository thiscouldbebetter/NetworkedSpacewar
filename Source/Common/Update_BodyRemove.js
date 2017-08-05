
function Update_BodyRemove(bodyID)
{
	this.bodyID = bodyID;
}

{
	Update_BodyRemove.prototype.updateWorld = function(world)
	{
		world.bodyIDsToRemove.push(this.bodyID);
	}
}
