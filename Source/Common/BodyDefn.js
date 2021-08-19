
class BodyDefn
{
	constructor
	(
		name,
		categoryNames,
		color,
		integrityMax,
		ticksToLive,
		massInKg,
		speedMax,
		accelerationPerTick,
		turnRate,
		energyMax,
		energyPerTick,
		radius,
		activity,
		actionCodes,
		devices,
		collide,
		visual
	)
	{
		this.name = name;
		this.categoryNames = categoryNames;
		this.color = color;
		this.integrityMax = integrityMax;
		this.ticksToLive = ticksToLive;
		this.massInKg = massInKg;
		this.speedMax = speedMax;
		this.accelerationPerTick = accelerationPerTick;
		this.turnRate = turnRate;
		this.energyMax = energyMax;
		this.energyPerTick = energyPerTick;
		this.radius = radius;
		this.activity = activity;
		this.actionCodes = actionCodes;
		this.devices = devices;
		this.collide = collide;
		this.visual = visual;
	}

	static planet(radius)
	{
		var color = ColorHelper.random();

		var activityGravitate = new Activity
		(
			"Gravitate",
			BodyDefn.planet_Gravitate
		);

		var visual = new VisualShape(new ShapeCircle(radius), color);

		var returnValue = new BodyDefn
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
			radius, // radius
			activityGravitate,
			[], // actionCodes
			[], // devices
			BodyDefn.planet_Collide,
			visual
		);

		return returnValue;
	}

	static planet_Collide(world, collider, other)
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
				planet.defn(world).radius
				+ other.defn(world).radius
			)
		);

		var speedAlongRadius = other.vel.dotProduct(direction);

		var accelOfReflection = direction.multiplyScalar(speedAlongRadius * 2);

		other.accel.subtract(accelOfReflection);
	};


	static planet_Gravitate(world, inputHelper, actor, activity)
	{
		var planet = actor;
		var planetDefn = planet.defn(world);
		var bodiesOther = world.bodies;
		for (var i = 0; i < bodiesOther.length; i++)
		{
			var bodyOther = bodiesOther[i];
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

	static player(name, radius)
	{
		var color = ColorHelper.random();

		var activityUserInputAccept = new Activity
		(
			"UserInputAccept",
			// perform
			(world, inputHelper, actor, activity) =>
			{
				if (inputHelper == null)
				{
					return;
				}

				activity.actionCodes.length = 0;

				var bodyDefn = actor.defn(world);

				var inputNamesActive = inputHelper.inputNamesActive;
				for (var i = 0; i < inputNamesActive.length; i++)
				{
					var inputNameActive = inputNamesActive[i];
					var action =
						world.actionByInputName(inputNameActive);
					if (action != null)
					{
						var actionCode = action.code;
						if (bodyDefn.actionCodes.indexOf(actionCode) >= 0)
						{
							activity.actionCodes.push(actionCode);
						}
					}
				}

				if (activity.actionCodes.length > 0)
				{
					var update = new Update_Actions
					(
						actor.id,
						activity.actionCodes
					);

					world.updatesOutgoing.push(update);
				}
			}
		);

		var visual = new VisualGroup
		([
			new VisualShape(new ShapeCircle(radius), color),
			new VisualShape(new ShapeRay(radius * 2), color),
			new VisualText(name, color)
		]);

		var actionCodes = [ 1, 2, 3, 4, 5, 6 ];

		var returnValue = new BodyDefn
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
			radius, // radius
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

	static projectile(radius)
	{
		var color = "Yellow";
		var visual = new VisualShape(new ShapeCircle(radius), color);

		return new BodyDefn
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
			radius, // radius
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

	// instance methods

	clone()
	{
		return new BodyDefn
		(
			this.name,
			this.categoryNames,
			this.color,
			this.integrityMax,
			this.ticksToLive,
			this.massInKg,
			this.speedMax,
			this.accelerationPerTick,
			this.turnRate,
			this.energyMax,
			this.energyPerTick,
			this.radius,
			this.activity.clone(),
			this.actionCodes,
			this.devices,
			this.collide,
			this.visual
		);
	}
}
