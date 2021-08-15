
class Update_BodyCreate
{
	constructor(body)
	{
		this.body = body;
	}

	updateWorld(world)
	{
		var bodyExisting = world.bodiesByName.get(this.body.id);
		if (bodyExisting == null)
		{
			world.bodiesToSpawn.push(this.body);
		}
	}
}
