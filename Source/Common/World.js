
function World(name, ticksPerSecond, size, actions, bodyDefns, bodiesInitial)
{
	this.name = name;
	this.ticksPerSecond = ticksPerSecond;
	this.size = size;
	this.actions = actions.addLookups("name").addLookups("inputName");
	this.bodyDefns = bodyDefns.addLookups("name");

	this.bodies = [];

	this.bodiesToSpawn = bodiesInitial.slice();
	this.bodyIDsToRemove = [];

	this.updatesImmediate = [];
	this.updatesOutgoing = [];
}
{
	// static methods

	World.build = function(arenaSize, planetSize, shipSize, bulletSize)
	{
		var actions =
		[
			new Action
			(
				"Accelerate",
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
				"Fire",
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
				"Jump",
				"j", // inputName
				function(world, body)
				{
					var device = body.devices["Jump"];
					device.use(world, body, device);
				}
			),

			new Action
			(
				"Quit",
				"Escape", // inputName
				function(world, body)
				{
					body.integrity = 0;
				}
			),

			new Action
			(
				"TurnLeft",
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
				"TurnRight",
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

		var actionNames = actions.members("name");

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
	};

	World.default = function()
	{
		return World.build(128, 10, 3, 1);
	};

	// instance methods

	World.prototype.bodyRemove = function(body)
	{
		if (body != null)
		{
			this.bodies.remove(body);
			this.bodies[body.id] = null;
			delete this.bodies[body.id];
		}
	};

	World.prototype.bodySpawn = function(body)
	{
		this.bodies.push(body);
		this.bodies[body.id] = body;
		body.initializeForWorld(this);
	};

	World.prototype.millisecondsPerTick = function()
	{
		return Math.floor(1000 / this.ticksPerSecond);
	};

	World.prototype.overwriteWith = function(other)
	{
		this.name = other.name;
		this.ticksPerSecond = other.ticksPerSecond;
		this.size = other.size;
		this.actions = other.actions;
		this.bodyDefns = other.bodyDefns;
		this.bodies = other.bodies;
	};

	World.prototype.updateForTick_Remove = function()
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
	};

	World.prototype.updateForTick_Spawn = function()
	{
		for (var i = 0; i < this.bodiesToSpawn.length; i++)
		{
			var body = this.bodiesToSpawn[i];
			this.bodySpawn(body);
		}
		this.bodiesToSpawn.length = 0;
	};

	World.prototype.updateForTick_UpdatesApply = function(updatesToApply)
	{
		for (var i = 0; i < updatesToApply.length; i++)
		{
			var update = updatesToApply[i];
			update.updateWorld(this);
		}
		updatesToApply.length = 0;
	};

	// drawable

	World.prototype.drawToDisplay = function(display)
	{
		display.clear("Black");

		var bodies = this.bodies;
		for (var i = 0; i < bodies.length; i++)
		{
			var body = bodies[i];
			body.drawToDisplay(display, this);
		}
	};
}
