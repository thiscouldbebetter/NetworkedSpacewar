
class World
{
	constructor
	(
		name, ticksPerSecond, size, actions, bodyDefns, bodiesInitial
	)
	{
		this.name = name;
		this.ticksPerSecond = ticksPerSecond;
		this.size = size;
		this.actions = ArrayHelper.addLookups(actions, "name");
		ArrayHelper.addLookups(this.actions, "inputName");
		this.bodyDefns = ArrayHelper.addLookups(bodyDefns, "name");

		this.bodies = [];

		this.bodiesToSpawn = bodiesInitial.slice();
		this.bodyIDsToRemove = [];

		this.updatesImmediate = [];
		this.updatesOutgoing = [];
	}

	// static methods

	static build(arenaSize, planetSize, shipSize, bulletSize)
	{
		var actions =
		[
			new Action
			(
				"T", // thrust
				"w", // inputName
				// perform
				function(world, body)
				{
					var bodyDefn = body.defn(world);
					var acceleration = bodyDefn.accelerationPerTick;

					var bodyLoc = body.loc;
					body.accel.add
					(
						bodyLoc.orientation.clone().multiplyScalar
						(
							acceleration
						)
					);
				}
			),

			new Action
			(
				"F", // fire
				"f", // inputName
				// peform
				function(world, body)
				{
					var device = body.devices["Gun"];
					device.use(world, body, device);
				}
			),

			new Action
			(
				"J", // hyperjump
				"j", // inputName
				function(world, body)
				{
					var device = body.devices["Jump"];
					device.use(world, body, device);
				}
			),

			new Action
			(
				"Q", // quit
				"Escape", // inputName
				function(world, body)
				{
					body.integrity = 0;
				}
			),

			new Action
			(
				"L", // turn left
				"a", // inputName
				function(world, body)
				{
					var bodyDefn = body.defn(world);
					var turnRate = bodyDefn.turnRate;

					var bodyLoc = body.loc;
					bodyLoc.orientation.subtract
					(
						bodyLoc.right.clone().multiplyScalar
						(
							turnRate
						)
					).normalize();

					bodyLoc.right.overwriteWith
					(
						bodyLoc.orientation
					).right();
				}
			),

			new Action
			(
				"R", // turn right
				"d", // inputName
				function(world, body)
				{
					var bodyDefn = body.defn(world);
					var turnRate = bodyDefn.turnRate;

					var bodyLoc = body.loc;
					bodyLoc.orientation.add
					(
						bodyLoc.right.clone().multiplyScalar(turnRate)
					).normalize();

					bodyLoc.right.overwriteWith
					(
						bodyLoc.orientation
					).right();
				}
			),
		];

		var actionNames = actions.map(x => x.name);

		var bodyDefnPlanet = BodyDefn.planet(planetSize);

		var worldSize = new Coords(1, 1).multiplyScalar(arenaSize);

		var bodyPlanet = new Body
		(
			"Planet", // id
			"", // name
			bodyDefnPlanet.name,
			new Location
			(
				worldSize.clone().divideScalar(2), // pos
				new Coords(1, 0) // orientation
			)
		);

		var returnValue = new World
		(
			"World0",
			20, // ticksPerSecond
			worldSize,
			actions,
			// bodyDefns
			[
				bodyDefnPlanet,
				BodyDefn.projectile(bulletSize),
				BodyDefn.player("_Player", shipSize),
			],
			// bodies
			[
				bodyPlanet
			]
		);

		return returnValue;
	}

	static create()
	{
		return World.build(128, 10, 3, 1);
	}

	// instance methods

	bodyRemove(body)
	{
		if (body != null)
		{
			ArrayHelper.remove(this.bodies, body);
			this.bodies[body.id] = null;
			delete this.bodies[body.id];
		}
	}

	bodySpawn(body)
	{
		this.bodies.push(body);
		this.bodies[body.id] = body;
		body.initializeForWorld(this);
	}

	millisecondsPerTick()
	{
		return Math.floor(1000 / this.ticksPerSecond);
	}

	overwriteWith(other)
	{
		this.name = other.name;
		this.ticksPerSecond = other.ticksPerSecond;
		this.size = other.size;
		this.actions = other.actions;
		this.bodyDefns = other.bodyDefns;
		this.bodies = other.bodies;
	}

	updateForTick_Remove()
	{
		// hack
		// If a client is paused, the updates build up,
		// and once processing resumes, the body may not be created
		// by the time this attempts to remove it,
		// so it can't remove it, but the list is cleared anyway,
		// so it forgets it needs to remove it,
		// so once it actually gets created it lasts forever.
		var bodyIDsThatCannotYetBeRemoved = [];

		for(var i = 0; i < this.bodyIDsToRemove.length; i++)
		{
			var bodyID = this.bodyIDsToRemove[i];
			var body = this.bodies[bodyID];
			if (body == null)
			{
				bodyIDsThatCannotYetBeRemoved.push(bodyID);
			}
			else
			{
				this.bodyRemove(body);
			}
		}
		this.bodyIDsToRemove = bodyIDsThatCannotYetBeRemoved;
	}

	updateForTick_Spawn()
	{
		for (var i = 0; i < this.bodiesToSpawn.length; i++)
		{
			var body = this.bodiesToSpawn[i];
			this.bodySpawn(body);
		}
		this.bodiesToSpawn.length = 0;
	}

	updateForTick_UpdatesApply(updatesToApply)
	{
		for (var i = 0; i < updatesToApply.length; i++)
		{
			var update = updatesToApply[i];
			update.updateWorld(this);
		}
		updatesToApply.length = 0;
	}

	// drawable

	drawToDisplay(display)
	{
		display.clear("Black");

		var bodies = this.bodies;
		for (var i = 0; i < bodies.length; i++)
		{
			var body = bodies[i];
			body.drawToDisplay(display, this);
		}
	}
}
