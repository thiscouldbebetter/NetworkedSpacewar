
class Local
{
	initialize()
	{
		var world = this.universe.world;

		this.clientId = "_" + IDHelper.Instance().idNext();

		this.updatesIncoming = [];

		var bodyDefnForUser = BodyDefn.player
		(
			world,
			3 // radius
		);
		var update = new Update_BodyDefnRegister(bodyDefnForUser);

		world.updatesOutgoing.push(update);

		var bodyForUser = new Body
		(
			this.clientId,
			this.clientId,
			bodyDefnForUser.name,
			new Location
			(
				new Coords(10, 10), // pos
				0 // forwardInTurns
			)
		);

		update = new Update_BodyCreate(bodyForUser);
		world.updatesOutgoing.push(update);

		setInterval
		(
			this.updateForTick.bind(this),
			world.millisecondsPerTick()
		);

		this.universe.initialize();
	}

	start()
	{
		this.clientId = IDHelper.Instance().idNext();
		this.document = document;

		var world = World.create();

		this.universe = new Universe(world);

		this.initialize();
	}

	updateForTick()
	{
		var world = this.universe.world;
		world.ticksSoFar++;

		world.updateForTick_UpdatesApply(this.updatesIncoming);

		world.updateForTick_Remove();

		world.updateForTick_Spawn();

		this.updateForTick_Client();

		this.updateForTick_Server();

		this.updateForTick_UpdatesOutgoingSend();
	}

	updateForTick_Client()
	{
		var universe = this.universe;
		var world = universe.world;

		var bodyForUser = world.bodyById(this.clientId);

		if (bodyForUser != null)
		{
			var activity = bodyForUser.activity;
			if (activity != null)
			{
				activity.perform
				(
					universe, world, bodyForUser, activity
				);
			}
		}

		world.drawToDisplay(universe.display);
	}

	updateForTick_Server()
	{
		var universe = this.universe;
		var world = universe.world;
		var bodies = world.bodies;

		for (var i = 0; i < bodies.length; i++)
		{
			var body = bodies[i];
			body.updateForTick_Integrity(universe, world);
			body.updateForTick_Actions(universe, world);
			body.updateForTick_Physics(universe, world);
		}

		for (var i = 0; i < bodies.length; i++)
		{
			var body = bodies[i];
			body.updateForTick_Collisions(universe, world, i);
		}
	}

	updateForTick_UpdatesOutgoingSend()
	{
		var world = this.universe.world;

		var updates = world.updatesOutgoing;
		for (var i = 0; i < updates.length; i++)
		{
			var update = updates[i];
			this.updatesIncoming.push(update);
		}
		world.updatesOutgoing.length = 0;
	}
}
