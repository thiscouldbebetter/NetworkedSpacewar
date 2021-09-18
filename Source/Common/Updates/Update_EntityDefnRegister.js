
class Update_EntityDefnRegister
{
	constructor(entityDefn)
	{
		this.entityDefn = entityDefn;
	}

	serialize(serializer)
	{
		return serializer.serialize(this);
	}

	updateWorld(world)
	{
		world.entityDefns.push(this.entityDefn);
		world.entityDefnsByName.set(this.entityDefn.name, this.entityDefn);
	}
}
