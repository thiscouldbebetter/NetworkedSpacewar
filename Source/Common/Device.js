
function Device(name, ticksToCharge, energyToUse, use)
{
	this.name = name;
	this.ticksToCharge = ticksToCharge;
	this.energyToUse = energyToUse;
	this.use = use;	

	this.ticksSinceUsed = 0;
}

{
	// static methods

	Device.gun = function()
	{
		var returnValue = new Device
		(
			"Gun",
			5, // ticksToCharge
			.3, // energyToUse
			// use
			function(world, body, device)
			{
				if (device.ticksSinceUsed < device.ticksToCharge)
				{
					return;
				}

				if (body.energy < device.energyToUse)
				{
					return;
				}

				device.ticksSinceUsed = 0;

				body.energy -= device.energyToUse;
				var bodyDefn = body.defn(world);

				var projectileDefn = world.bodyDefns["Projectile"];

				var projectileID = "P" + IDHelper.IDNext();

				var projectile = new Body
				(
					projectileID,
					"", // no name
					projectileDefn.name,
					body.pos.clone().add
					(
						body.orientation.clone().multiplyScalar
						(
							bodyDefn.radius * 1.1
						)
					).add
					(
						body.vel
					),
					body.orientation.clone()
				);
	
				projectile.vel.overwriteWith
				(
					body.orientation
				).multiplyScalar
				(
					projectileDefn.speedMax
				);

				var update = new Update_BodyCreate(projectile);
				world.updatesImmediate.push(update);
				world.updatesOutgoing.push(update);
			}
		);

		return returnValue;
	}

	Device.jump = function()
	{
		var returnValue = new Device
		(
			"Jump",
			50, // ticksToCharge
			1, // energyToUse
			// use
			function(world, body, device)
			{
				if (device.ticksSinceUsed < device.ticksToCharge)
				{
					return;
				}

				if (body.energy < device.energyToUse)
				{
					return;
				}

				device.ticksSinceUsed = 0;

				body.energy -= device.energyToUse;

				body.pos.randomize().multiply
				(
					world.size
				);
			}
		);

		return returnValue;
	}

	// instance methods

	Device.prototype.clone = function()
	{
		return new Device(this.name, this.ticksToCharge, this.energyToUse, this.use);
	}	

	Device.prototype.updateForTick = function(world, body)
	{
		this.ticksSinceUsed++;
	}
}
