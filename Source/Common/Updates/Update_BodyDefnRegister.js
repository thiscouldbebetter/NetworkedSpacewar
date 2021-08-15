
class Update_BodyDefnRegister
{
	constructor(bodyDefn)
	{
		this.bodyDefn = bodyDefn;
	}

	updateWorld(world)
	{
		world.bodyDefns.push(this.bodyDefn);
		world.bodyDefnsByName.set(this.bodyDefn.name, this.bodyDefn);
	}
}
