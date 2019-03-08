
function Body(id, name, defnName, pos, orientation)
{
	this.id = id;
	this.name = name;
	this.defnName = defnName;
	this.pos = pos;
	this.orientation = orientation;

	this.vel = new Coords(0, 0);
	this.accel = new Coords(0, 0);
	this.right = this.orientation.clone().right();
}

{
	// instance methods

	Body.prototype.collideWith = function(world, other)
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
	};

	Body.prototype.defn = function(world)
	{
		var returnValue = world.bodyDefns[this.defnName];
		return returnValue;
	};

	Body.prototype.initializeForWorld = function(world)
	{
		var bodyDefn = this.defn(world);
		this.integrity = bodyDefn.integrityMax;
		this.ticksToLive = bodyDefn.ticksToLive;
		this.energy = 0;
		this.ticksSinceActionPerformed = 0;
		this.devices = bodyDefn.devices.clone().addLookups("name");
		this.activity = bodyDefn.activity;
	};

	Body.prototype.overwriteWith = function(other)
	{
		this.defnName = other.defnName;
		this.pos.overwriteWith(other.pos);
		this.orientation.overwriteWith(other.orientation);
		this.vel.overwriteWith(other.vel);
		this.accel.overwriteWith(other.accel);
		this.right.overwriteWith(other.right);
	};

	Body.prototype.updateForTick_Actions = function(world)
	{
		if (this.activity != null)
		{
			var bodyDefn = this.defn(world);

			this.activity.perform(world, null, this, this.activity);

			var actionNames = this.activity.actionNames;

			for (var a = 0; a < actionNames.length; a++)
			{
				var actionName = actionNames[a];
				var action = world.actions[actionName];
				action.perform(world, this);
			}

			actionNames.length = 0;

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
	};

	Body.prototype.updateForTick_Collisions = function(world, i)
	{
		var bodies = world.bodies;

		for (var j = i + 1; j < bodies.length; j++)
		{
			var bodyOther = bodies[j];

			var distanceFromThisToOther = bodyOther.pos.clone().subtract
			(
				this.pos
			).magnitude();

			var sumOfRadii =
				this.defn(world).radius
				+ bodyOther.defn(world).radius;

			if (distanceFromThisToOther < sumOfRadii)
			{
				this.collideWith(world, bodyOther);
			}
		}
	};

	Body.prototype.updateForTick_Integrity = function(world)
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
			if (this.defn(world).categoryNames.contains("Player") == true)
			{
				Log.write(this.name + " was destroyed.")
			}
			var update = new Update_BodyRemove
			(
				this.id
			);
			world.updatesImmediate.push(update);
			world.updatesOutgoing.push(update);
		}
	};

	Body.prototype.updateForTick_Physics = function(world)
	{
		var bodyDefn = this.defn(world);

		this.vel.add
		(
			this.accel
		).trimToMagnitude
		(
			bodyDefn.speedMax
		);

		this.pos.add
		(
			this.vel
		).wrapToRange
		(
			world.size
		);

		this.accel.clear();

		if (bodyDefn.speedMax != 0 || bodyDefn.turnRate != 0)
		{
			var update = new Update_Physics
			(
				this.id, this.pos, this.orientation
			);

			world.updatesOutgoing.push(update);
		}
	};

	// drawable
	Body.prototype.drawToDisplay = function(display, world)
	{
		var body = this;

		var bodyPos = body.pos;
		var bodyDefn = body.defn(world);
		var bodySize = bodyDefn.radius;
		var bodyColor = bodyDefn.color;

		display.drawText(body.name, bodyPos, bodyColor);
		display.drawCircle(bodyPos, bodySize, bodyColor);

		if (bodyDefn.speedMax != 0) // hack
		{
			display.drawRay(bodyPos, body.orientation, bodySize * 2, bodyColor)
		}
	};
}
