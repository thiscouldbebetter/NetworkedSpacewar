
class World
{
	constructor
	(
		name,
		ticksPerSecond,
		size,
		playersMax,
		actions,
		entityDefns,
		entitiesInitial
	)
	{
		this.name = name;
		this.ticksPerSecond = ticksPerSecond;
		this.size = size;
		this.playersMax = playersMax;

		this.actions = actions;

		this.entityDefns = entityDefns;

		this.entities = [];

		this.entitiesToSpawn = entitiesInitial.slice();
		this.entityIdsToRemove = [];

		this.updatesImmediate = [];
		this.updatesOutgoing = [];

		this.timerTicksSoFar = 0;

		this.lookupsBuild();

		this.entitiesSpawn();
	}

	lookupsBuild()
	{
		this.actionsByCode =
			ArrayHelper.addLookups(this.actions, (x) => x.code);
		this.actionsByInputName =
			ArrayHelper.addLookups(this.actions, (e) => e.inputName);

		this.entityDefnsByName = ArrayHelper.addLookupsByName(this.entityDefns);

		this.entitiesById = ArrayHelper.addLookups(this.entities, x => x.id);
	}

	// static methods

	static build
	(
		playersMax, arenaSize, planetSize, shipSize, bulletSize
	)
	{
		var actions =
		[
			new Action
			(
				"T", // thrust
				0, // code
				"w", // inputName
				// perform
				(world, entity) =>
				{
					var entityDefn = entity.defn(world);
					var acceleration = entityDefn.accelerationPerTick;

					var entityLoc = entity.loc;
					entity.accel.add
					(
						entityLoc.orientation.forward.clone().multiplyScalar
						(
							acceleration
						)
					);
				}
			),

			new Action
			(
				"L", // turn left
				1, // code
				"a", // inputName
				(world, entity) =>
				{
					var entityDefn = entity.defn(world);
					var turnRate = entityDefn.turnRate;

					var entityLoc = entity.loc;
					var entityOri = entityLoc.orientation;
					var entityForward = entityOri.forward;
					var entityRight = entityOri.right;
					entityForward.subtract
					(
						entityRight.clone().multiplyScalar
						(
							turnRate
						)
					).normalize();

					entityRight.overwriteWith
					(
						entityForward
					).right();

					entityOri.orthogonalize();
				}
			),

			new Action
			(
				"R", // turn right
				2, // code
				"d", // inputName
				(world, entity) =>
				{
					var entityDefn = entity.defn(world);
					var turnRate = entityDefn.turnRate;

					var entityLoc = entity.loc;
					var entityOri = entityLoc.orientation;
					var entityForward = entityOri.forward;
					var entityRight = entityOri.right;
					entityForward.add
					(
						entityRight.clone().multiplyScalar
						(
							turnRate
						)
					).normalize();

					entityRight.overwriteWith
					(
						entityForward
					).right();

					entityOri.orthogonalize();
				}
			),

			new Action
			(
				"F", // fire
				3, // code
				"f", // inputName
				// peform
				(world, entity) =>
				{
					var device = entity.devicesByName.get("Gun");
					device.use(world, entity, device);
				}
			),

			new Action
			(
				"J", // hyperjump
				4, // code
				"j", // inputName
				(world, entity) =>
				{
					var device = entity.devicesByName.get("Jump");
					device.use(world, entity, device);
				}
			),

			new Action
			(
				"Q", // quit
				5, // code
				"Escape", // inputName
				(world, entity) =>
				{
					entity.integrity = 0;
				}
			),
		];

		var actionNames = actions.map(x => x.name);

		var entityDefnPlanet = EntityDefn.planet(planetSize);

		var worldSize = new Coords(1, 1).multiplyScalar(arenaSize);

		var entityPlanet = new Entity
		(
			"Planet", // id
			"", // name
			entityDefnPlanet.name,
			new Location
			(
				worldSize.clone().divideScalar(2), // pos
				0, // forwardInTurns
			)
		);

		var returnValue = new World
		(
			"World0",
			20, // ticksPerSecond
			worldSize,
			playersMax,
			actions,
			// entityDefns
			[
				entityDefnPlanet,
				EntityDefn.projectile(bulletSize),
				EntityDefn.player("_Player", shipSize),
			],
			// entities
			[
				entityPlanet
			]
		);

		return returnValue;
	}

	static create()
	{
		return World.build
		(
			// playersMax, arenaSize, planetSize, shipSize, bulletSize
			2, 128, 10, 3, 1
		);
	}

	// instance methods

	actionByCode(actionCode)
	{
		actionCode = parseInt(actionCode); // hack
		var returnValue = this.actionsByCode.get(actionCode);
		return returnValue;
	}

	actionByInputName(inputName)
	{
		return this.actionsByInputName.get(inputName);
	}

	entitiesSpawn()
	{
		this.entitiesToSpawn.forEach(x => this.entitySpawn(x));
		this.entitiesToSpawn.length = 0;
	}

	entityById(entityId)
	{
		return this.entitiesById.get(entityId);
	}

	entityIdNext()
	{
		var entityId = null;

		for (var i = 0; i <= this.entities.length; i++)
		{
			if (this.entitiesById.has(i) == false)
			{
				entityId = i;
				break;
			}
		}

		return entityId;
	}

	entityRemove(entity)
	{
		if (entity != null)
		{
			ArrayHelper.remove(this.entities, entity);
			this.entitiesById.delete(entity.id);
		}
	}

	entitySpawn(entityToSpawn)
	{
		var entityId = this.entityIdNext();

		entityToSpawn.id = entityId;
		this.entities.push(entityToSpawn);
		this.entitiesById.set(entityToSpawn.id, entityToSpawn);
		entityToSpawn.initializeForWorld(this);
	}

	initialize()
	{
		this.lookupsBuild();
		return this;
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
		this.entityDefns = other.entityDefns;
		this.entities = other.entities;
	}

	updateForTick_Remove()
	{
		// hack
		// If a client is paused, the updates build up,
		// and once processing resumes, the entity may not be created
		// by the time this attempts to remove it,
		// so it can't remove it, but the list is cleared anyway,
		// so it forgets it needs to remove it,
		// so once it actually gets created it lasts forever.
		var entityIdsThatCannotYetBeRemoved = [];

		for(var i = 0; i < this.entityIdsToRemove.length; i++)
		{
			var entityId = this.entityIdsToRemove[i];
			var entity = this.entityById(entityId);
			if (entity == null)
			{
				entityIdsThatCannotYetBeRemoved.push(entityId);
			}
			else
			{
				this.entityRemove(entity);
			}
		}
		this.entityIdsToRemove = entityIdsThatCannotYetBeRemoved;
	}

	updateForTick_UpdatesApply(updatesToApply)
	{
		this.timerTicksSoFar++;

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

		var entities = this.entities;
		for (var i = 0; i < entities.length; i++)
		{
			var entity = entities[i];
			entity.drawToDisplay(display, this);
		}
	}
}
