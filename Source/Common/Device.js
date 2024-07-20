
class Device
{
	constructor(name, ticksToCharge, energyToUse, use)
	{
		this.name = name;
		this.ticksToCharge = ticksToCharge;
		this.energyToUse = energyToUse;
		this.use = use;

		this.ticksSinceUsedClear();
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
			(world, entity, device) =>
			{
				if (device.ticksSinceUsedGet() < device.ticksToCharge)
				{
					return;
				}

				if (entity.energy < device.energyToUse)
				{
					return;
				}

				device.ticksSinceUsedClear();

				entity.energy -= device.energyToUse;
				var entityDefn = entity.defn(world);

				var projectileDefn = world.entityDefnsByName.get("Projectile");

				var projectileID = "P" + IDHelper.Instance().idNext();

				var entityLoc = entity.loc;
				var entityOri = entityLoc.orientation;
				var entityForward = entityOri.forward;
				var projectile = new Entity
				(
					projectileID,
					"Proj" + IDHelper.Instance().idNext(), // todo
					projectileDefn.name,
					new Location
					(
						// pos
						entityLoc.pos.clone().add
						(
							entityForward.clone().multiplyScalar
							(
								entityDefn.collider.radius * 1.1
							)
						).add
						(
							entity.vel
						),
						entityForward.headingInTurns()
					)
				);

				projectile.vel.overwriteWith
				(
					entityForward
				).multiplyScalar
				(
					projectileDefn.speedMax
				);

				var update = new Update_EntityCreate(projectile);
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
			(world, entity, device) =>
			{
				if (device.ticksSinceUsedGet() < device.ticksToCharge)
				{
					return;
				}

				if (entity.energy < device.energyToUse)
				{
					return;
				}

				device.ticksSinceUsedClear();

				entity.energy -= device.energyToUse;

				entity.loc.pos.randomize().multiply
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

	ticksSinceUsedClear()
	{
		this.ticksSinceUsedSet(0);
	}

	ticksSinceUsedGet()
	{
		return this._ticksSinceUsed;
	}

	ticksSinceUsedIncrement()
	{
		this.ticksSinceUsedSet(this.ticksSinceUsedGet() + 1);
	}

	ticksSinceUsedSet(value)
	{
		this._ticksSinceUsed = value;
	}

	updateForTick(world, entity)
	{
		this.ticksSinceUsedIncrement();
	}
}
