
function Update_BodyCreate(body)
{
	this.body = body;
}

{
	Update_BodyCreate.prototype.updateWorld = function(world)
	{
		var bodyExisting = world.bodies[this.body.id];
		if (bodyExisting == null)
		{
			world.bodiesToSpawn.push(this.body);
		}
	};
}
