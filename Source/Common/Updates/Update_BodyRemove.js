
class Update_BodyRemove
{
	constructor(bodyId)
	{
		this.bodyId = bodyId;
	}

	updateWorld(world)
	{
		world.bodyIdsToRemove.push(this.bodyId);
	}
}
