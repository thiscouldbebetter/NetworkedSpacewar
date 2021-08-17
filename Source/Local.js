
class Local
{
	initialize()
	{
		this.clientID = "_" + IDHelper.Instance().idNext();

		this.updatesIncoming = [];

		var bodyDefnForUser = BodyDefn.player
		(
			this.world,
			3 // radius
		);
		var update = new Update_BodyDefnRegister(bodyDefnForUser);
		this.world.updatesOutgoing.push(update);

		var bodyForUser = new Body
		(
			this.clientID,
			this.clientID,
			bodyDefnForUser.name,
			new Location
			(
				new Coords(10, 10), // pos
				0 // forwardInTurns
			)
		);
		
		update = new Update_BodyCreate(bodyForUser);
		this.world.updatesOutgoing.push(update);

		setInterval
		(
			this.updateForTick.bind(this),
			this.world.millisecondsPerTick()
		);

		this.display = new Display("divDisplay", this.world.size);
		this.display.initialize(document);

		this.inputHelper = new InputHelper();
		this.inputHelper.initialize(document, this.display);
	}

	start()
	{
		this.clientID = IDHelper.Instance().idNext();
		this.document = document;

		this.world = World.create();

		this.initialize();
	}

	updateForTick()
	{
		var world = this.world;
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
		var world = this.world;

		var bodyForUser = world.bodiesByName.get(this.clientID);

		if (bodyForUser != null)
		{
			var activity = bodyForUser.activity;
			if (activity != null)
			{
				activity.perform(world, this.inputHelper, bodyForUser, activity);
			}
		}

		this.world.drawToDisplay(this.display);
	}

	updateForTick_Server()
	{
		var world = this.world;
		var bodies = world.bodies;

		for (var i = 0; i < bodies.length; i++)
		{
			var body = bodies[i];
			body.updateForTick_Integrity(world);
			body.updateForTick_Actions(world);
			body.updateForTick_Physics(world);
		}

		for (var i = 0; i < bodies.length; i++)
		{
			var body = bodies[i];
			body.updateForTick_Collisions(world, i);
		}
	}

	updateForTick_UpdatesOutgoingSend()
	{
		var world = this.world;

		var updates = world.updatesOutgoing;
		for (var i = 0; i < updates.length; i++)
		{
			var update = updates[i];
			this.updatesIncoming.push(update);
		}
		world.updatesOutgoing.length = 0;
	}
}
