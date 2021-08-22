
class Update_BodyCreate
{
	constructor(body)
	{
		this.body = body;
	}

	updateWorld(world)
	{
		var bodyExisting = world.bodyById(this.body.id);
		if (bodyExisting == null)
		{
			world.bodiesToSpawn.push(this.body);
		}
	}

	serialize(serializer)
	{
		return serializer.serialize(this);
	}
}
