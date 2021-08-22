
class Update_BodyDefnRegister
{
	constructor(bodyDefn)
	{
		this.bodyDefn = bodyDefn;
	}

	serialize(serializer)
	{
		return serializer.serialize(this);
	}

	updateWorld(world)
	{
		world.bodyDefns.push(this.bodyDefn);
		world.bodyDefnsByName.set(this.bodyDefn.name, this.bodyDefn);
	}
}
