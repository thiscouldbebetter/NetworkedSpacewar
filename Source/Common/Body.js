
class Body
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
		var bodyDefnThis = this.defn(world);
		var bodyDefnOther = other.defn(world);

		if (bodyDefnThis.collide != null)
		{
			bodyDefnThis.collide(world, this, other);
		}
		if (bodyDefnOther.collide != null)
		{
			bodyDefnOther.collide(world, other, this);
		}
	}

	defn(world)
	{
		var returnValue = world.bodyDefnsByName.get(this.defnName);
		return returnValue;
	}

	initializeForWorld(world)
	{
		var bodyDefn = this.defn(world);
		this.integrity = bodyDefn.integrityMax;
		this.ticksToLive = bodyDefn.ticksToLive;
		this.energy = 0;
		this.ticksSinceActionPerformed = 0;
		this.devices = ArrayHelper.clone(bodyDefn.devices);
		this.devicesByName =
			ArrayHelper.addLookupsByName(this.devices);
		this.activity = bodyDefn.activity;
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
			var bodyDefn = this.defn(world);

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

			this.energy += bodyDefn.energyPerTick;
			if (this.energy > bodyDefn.energyMax)
			{
				this.energy = bodyDefn.energyMax;
			}
		}
	}

	updateForTick_Collisions(universe, world, i)
	{
		var bodies = world.bodies;

		for (var j = i + 1; j < bodies.length; j++)
		{
			var bodyOther = bodies[j];

			var distanceFromThisToOther = bodyOther.loc.pos.clone().subtract
			(
				this.loc.pos
			).magnitude();

			var sumOfRadii =
				this.defn(world).radius
				+ bodyOther.defn(world).radius;

			if (distanceFromThisToOther < sumOfRadii)
			{
				this.collideWith(world, bodyOther);
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
			var update = new Update_BodyRemove
			(
				this.id
			);
			world.updatesImmediate.push(update);
			world.updatesOutgoing.push(update);
		}
	}

	updateForTick_Physics(universe, world)
	{
		var bodyDefn = this.defn(world);

		this.vel.add
		(
			this.accel
		).trimToMagnitudeMax
		(
			bodyDefn.speedMax
		);

		this.loc.pos.add
		(
			this.vel
		).wrapToRangeMax
		(
			world.size
		);

		this.accel.clear();

		if (bodyDefn.speedMax != 0 || bodyDefn.turnRate != 0)
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
