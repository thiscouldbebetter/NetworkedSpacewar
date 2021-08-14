
class Device
{
	constructor(name, ticksToCharge, energyToUse, use)
	{
		this.name = name;
		this.ticksToCharge = ticksToCharge;
		this.energyToUse = energyToUse;
		this.use = use;

		this.ticksSinceUsed = 0;
	}

	// static methods

	static gun()
	{
		var returnValue = new Device
		(
			"Gun",
			5, // ticksToCharge
			.3, // energyToUse
			// use
			(world, body, device) =>
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

				var projectileDefn = world.bodyDefnsByName.get("Projectile");

				var projectileID = "P" + IDHelper.Instance().idNext();

				var bodyLoc = body.loc;
				var bodyOri = bodyLoc.orientation;
				var bodyForward = bodyOri.forward;
				var projectile = new Body
				(
					projectileID,
					"", // no name
					projectileDefn.name,
					new Location
					(
						// pos
						bodyLoc.pos.clone().add
						(
							bodyForward.clone().multiplyScalar
							(
								bodyDefn.radius * 1.1
							)
						).add
						(
							body.vel
						),
						bodyForward.headingInTurns()
					)
				);

				projectile.vel.overwriteWith
				(
					bodyForward
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

	static jump()
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

				body.loc.pos.randomize().multiply
				(
					world.size
				);
			}
		);

		return returnValue;
	}

	// instance methods

	clone()
	{
		return new Device(this.name, this.ticksToCharge, this.energyToUse, this.use);
	}

	updateForTick(world, body)
	{
		this.ticksSinceUsed++;
	}
}
