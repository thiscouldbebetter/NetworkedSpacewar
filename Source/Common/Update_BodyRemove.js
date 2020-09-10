
class Update_BodyRemove
{
	constructor(bodyID)
	{
		this.bodyID = bodyID;
	}

	updateWorld(world)
	{
		world.bodyIDsToRemove.push(this.bodyID);
	}
}
