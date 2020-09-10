
class Update_BodyDefnRegister
{
	constructor(bodyDefn)
	{
		this.bodyDefn = bodyDefn;
	}

	updateWorld(world)
	{
		world.bodyDefns.push(this.bodyDefn);
		world.bodyDefns[this.bodyDefn.name] = this.bodyDefn;
	}
}
