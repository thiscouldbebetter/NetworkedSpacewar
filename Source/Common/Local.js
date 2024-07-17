
class Local
{
	initialize()
	{
		var world = this.universe.world;

		this.clientId = "_" + IDHelper.Instance().idNext();

		this.updatesIncoming = [];

		var entityDefnForUser = new EntityDefnBuilderSpacewar().player
		(
			world,
			3 // radius
		);
		var update = new Update_EntityDefnRegister(entityDefnForUser);

		world.updatesOutgoing.push(update);

		var entityForUser = new Entity
		(
			this.clientId,
			this.clientId,
			entityDefnForUser.name,
			new Location
			(
				new Coords(10, 10), // pos
				0 // forwardInTurns
			)
		);

		update = new Update_EntityCreate(entityForUser);
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

		var worldBuilder =
			new WorldBuilderSpacewar();
			// new WorldBuilderChess();
		var world = worldBuilder.buildDefault();

		this.universe = new Universe(world);

		this.initialize();
	}

	updateForTick()
	{
		var world = this.universe.world;
		world.ticksSoFar++;

		world.updateForTick_UpdatesApply(this.updatesIncoming);

		world.updateForTick_Remove();

		world.entitiesSpawn();

		this.updateForTick_Client();

		this.updateForTick_Server();

		this.updateForTick_UpdatesOutgoingSend();
	}

	updateForTick_Client()
	{
		var universe = this.universe;
		var world = universe.world;

		var entityForUser = world.entityById(this.clientId);

		if (entityForUser != null)
		{
			var activity = entityForUser.activity;
			if (activity != null)
			{
				activity.perform
				(
					universe, world, entityForUser, activity
				);
			}
		}

		world.drawToDisplay(universe.display);
	}

	updateForTick_Server()
	{
		var universe = this.universe;
		var world = universe.world;
		var entities = world.entities;

		for (var i = 0; i < entities.length; i++)
		{
			var entity = entities[i];
			entity.updateForTick_Integrity(universe, world);
			entity.updateForTick_Actions(universe, world);
			entity.updateForTick_Physics(universe, world);
		}

		for (var i = 0; i < entities.length; i++)
		{
			var entity = entities[i];
			entity.updateForTick_Collisions(universe, world, i);
		}
	}

	updateForTick_UpdatesOutgoingSend()
	{
		var world = this.universe.world;

		var worldUpdatesOutgoing = world.updatesOutgoing;
		this.updatesIncoming.push(...worldUpdatesOutgoing);
		worldUpdatesOutgoing.length = 0;
	}
}
