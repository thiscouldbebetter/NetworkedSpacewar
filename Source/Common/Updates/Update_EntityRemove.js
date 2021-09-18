
class Update_EntityRemove
{
	constructor(entityId)
	{
		this.entityId = entityId;
	}

	updateWorld(world)
	{
		world.entityIdsToRemove.push(this.entityId);
	}

	// Serialization.

	serialize(serializer)
	{
		return serializer.serialize(this);
	}
}
