
class Entity
{
	constructor(id, name, defnName, loc)
	{
		this.id = id;
		this.name = name;
		this.defnName = defnName;
		this.loc = loc;

		this.vel = Coords.zeroes();
		this.accel = Coords.zeroes();
	}

	// instance methods

	collideWith(world, other)
	{
		var entityDefnThis = this.defn(world);
		var entityDefnOther = other.defn(world);

		if (entityDefnThis.collide != null)
		{
			entityDefnThis.collide(world, this, other);
		}
		if (entityDefnOther.collide != null)
		{
			entityDefnOther.collide(world, other, this);
		}
	}

	defn(world)
	{
		var returnValue = world.entityDefnsByName.get(this.defnName);
		return returnValue;
	}

	initializeForWorld(world)
	{
		var entityDefn = this.defn(world);
		this.integrity = entityDefn.integrityMax;
		this.ticksToLive = entityDefn.ticksToLive;
		this.energy = 0;
		this.ticksSinceActionPerformed = 0;
		this.devices = ArrayHelper.clone(entityDefn.devices);
		this.devicesByName =
			ArrayHelper.addLookupsByName(this.devices);
		this.activity = entityDefn.activity;
	}

	overwriteWith(other)
	{
		this.defnName = other.defnName;
		this.loc.overwriteWith(other.loc);
		this.vel.overwriteWith(other.vel);
		this.accel.overwriteWith(other.accel);
	}

	updateForTick_Actions(universe, world)
	{
		if (this.activity != null)
		{
			var entityDefn = this.defn(world);

			this.activity.perform(universe, world, this, this.activity);

			var actionCodes = this.activity.actionCodes;

			for (var a = 0; a < actionCodes.length; a++)
			{
				var actionCode = actionCodes[a];
				var action = world.actionByCode(actionCode);
				if (action != null)
				{
					action.perform(world, this);
				}
			}

			actionCodes.length = 0;

			for (var d = 0; d < this.devices.length; d++)
			{
				var device = this.devices[d];
				device.updateForTick(world, this);
			}

			this.energy += entityDefn.energyPerTick;
			if (this.energy > entityDefn.energyMax)
			{
				this.energy = entityDefn.energyMax;
			}
		}
	}

	updateForTick_Collisions(universe, world, i)
	{
		var entities = world.entities;

		for (var j = i + 1; j < entities.length; j++)
		{
			var entityOther = entities[j];

			var distanceFromThisToOther = entityOther.loc.pos.clone().subtract
			(
				this.loc.pos
			).magnitude();

			var sumOfRadii =
				this.defn(world).collider.radius
				+ entityOther.defn(world).collider.radius;

			if (distanceFromThisToOther < sumOfRadii)
			{
				this.collideWith(world, entityOther);
			}
		}
	}

	updateForTick_Integrity(universe, world)
	{
		if (this.ticksToLive != null)
		{
			this.ticksToLive--;
			if (this.ticksToLive <= 0)
			{
				this.integrity = 0;
			}
		}

		if (this.integrity <= 0)
		{
			if (this.defn(world).categoryNames.indexOf("Player") >= 0)
			{
				Log.Instance().write(this.name + " was destroyed.")
			}
			var update = new Update_EntityRemove
			(
				this.id
			);
			world.updatesImmediate.push(update);
			world.updatesOutgoing.push(update);
		}
	}

	updateForTick_Physics(universe, world)
	{
		var entityDefn = this.defn(world);

		this.vel.add
		(
			this.accel
		).trimToMagnitudeMax
		(
			entityDefn.speedMax
		);

		this.loc.pos.add
		(
			this.vel
		).wrapToRangeMax
		(
			world.size
		);

		this.accel.clear();

		if (entityDefn.speedMax != 0 || entityDefn.turnRate != 0)
		{
			var update = new Update_Physics
			(
				this.id, this.loc
			);

			world.updatesOutgoing.push(update);
		}
	}

	// drawable

	drawToDisplay(display, world)
	{
		var defn = this.defn(world);
		defn.visual.draw(display, this);
	}
}
