
class Update_EntityCreate
{
	constructor(entity)
	{
		this.entity = entity;
	}

	updateWorld(world)
	{
		var entityExisting = world.entityById(this.entity.id);
		if (entityExisting == null)
		{
			world.entityToSpawnAdd(this.entity);
		}
	}

	serialize(serializer)
	{
		return serializer.serialize(this);
	}
}
