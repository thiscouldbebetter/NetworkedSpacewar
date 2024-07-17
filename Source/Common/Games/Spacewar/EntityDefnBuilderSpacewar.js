
class EntityDefnBuilderSpacewar
{
	planet(radius)
	{
		var color = ColorHelper.random();

		var activityGravitate = new Activity
		(
			"Gravitate",
			this.planet_Gravitate
		);

		var collider = new ShapeCircle(radius);

		var visual = new VisualShape(collider, color);

		var returnValue = new EntityDefn
		(
			"Planet",
			[ "Planet" ], // categoryNames
			color,
			Number.POSITIVE_INFINITY, // integrityMax
			null, // ticksToLive
			6 * Math.pow(10, 24), // massInKg (Earth actual)
			0, // speedMax
			0, // accelerationPerTick
			0, // turnRate
			0, // energyMax
			0, // energyPerTick
			collider,
			activityGravitate,
			[], // actionCodes
			[], // devices
			this.planet_Collide,
			visual
		);

		return returnValue;
	}

	planet_Collide(world, collider, other)
	{
		var planet = collider;
		var displacement = other.loc.pos.clone().subtract
		(
			planet.loc.pos
		);

		var distance = displacement.magnitude();

		var direction = displacement.divideScalar(distance);

		other.loc.pos.overwriteWith
		(
			planet.loc.pos
		).add
		(
			direction.clone().multiplyScalar
			(
				planet.defn(world).collider.radius
				+ other.defn(world).collider.radius
			)
		);

		var speedAlongRadius = other.vel.dotProduct(direction);

		var accelOfReflection = direction.multiplyScalar(speedAlongRadius * 2);

		other.accel.subtract(accelOfReflection);
	}

	planet_Gravitate(universe, world, actor, activity)
	{
		var planet = actor;
		var planetDefn = planet.defn(world);
		var entitiesOther = world.entities;
		for (var i = 0; i < entitiesOther.length; i++)
		{
			var bodyOther = entitiesOther[i];
			if (bodyOther != planet)
			{
				if (bodyOther.massInKg != 0)
				{
					var displacement = bodyOther.loc.pos.clone().subtract
					(
						planet.loc.pos
					);
					var distance = displacement.magnitude();

					if (distance > 0)
					{
						var bodyOtherDefn = bodyOther.defn(world);

						var direction = displacement.divideScalar
						(
							distance
						);

						var gravityConstantInPixels2OverKg2 = 2 * Math.pow(10, -24);

						var accelDueToGravity = direction.multiplyScalar
						(
							gravityConstantInPixels2OverKg2 * planetDefn.massInKg
						).divideScalar
						(
							distance * distance
						);

						bodyOther.accel.subtract(accelDueToGravity);
					}
				}
			}
		}
	}

	player(name, radius)
	{
		var color = ColorHelper.random();

		var activityUserInputAccept = new Activity
		(
			"UserInputAccept",
			// perform
			EntityDefn.activityUserInputAcceptPerform
		);

		var collider = new ShapeCircle(radius);

		var visual = new VisualGroup
		([
			new VisualShape(collider, color),
			new VisualShape(new ShapeRay(radius * 2), color),
			new VisualText(name, color)
		]);

		var actionCodes = [ 0, 1, 2, 3, 4, 5 ];

		var returnValue = new EntityDefn
		(
			name,
			[ "Player" ], // categoryNames
			color,
			1, // integrityMax
			null, // ticksToLive
			10000, // massInKg (10 tonnes)
			radius, // speedMax
			radius / 20, // accelerationPerTick
			.15, // turnRate
			1, // energyMax
			.1, // energyPerTick
			collider,
			activityUserInputAccept, // activity
			actionCodes,
			// devices
			[
				Device.gun(),
				Device.jump(),
			],
			null, // collide
			visual
		);

		return returnValue;
	}

	projectile(radius)
	{
		var color = "Yellow";
		var collider = new ShapeCircle(radius);
		var visual = new VisualShape(collider, color);

		return new EntityDefn
		(
			"Projectile", // name
			[], // categoryNames
			color,
			1, // integrityMax
			10, // ticksToLive
			0, // massInKg
			8 * radius, // speedMax
			0, // accelerationPerTick
			0, // turnRate
			0, // energyMax
			0, // energyPerTick
			collider,
			null, // activity
			[], // actionCodes
			[], // devices
			// collide
			(world, collider, other) =>
			{
				this.integrity = 0;
				other.integrity--;
			},
			visual
		);
	}


}