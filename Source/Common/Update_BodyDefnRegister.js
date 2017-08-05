
function Update_BodyDefnRegister(bodyDefn)
{
	this.bodyDefn = bodyDefn;
}

{
	Update_BodyDefnRegister.prototype.updateWorld = function(world)
	{
		world.bodyDefns.push(this.bodyDefn);
		world.bodyDefns[this.bodyDefn.name] = this.bodyDefn;
	}
}
