
class WorldBuilderSpacewar
{
	build
	(
		playersMax, arenaSize, planetSize, shipSize, bulletSize
	)
	{
		var actions = this.build_Actions();

		var actionNames = actions.map(x => x.name);

		var entityDefnBuilder = new EntityDefnSpacewarBuilder();
		var entityDefnPlanet = entityDefnBuilder.planet(planetSize);

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
				entityDefnBuilder.projectile(bulletSize),
				entityDefnBuilder.player("_Player", shipSize),
			],
			// entities
			[
				entityPlanet
			]
		);

		return returnValue;
	}

	build_Actions()
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

		return actions;
	}

	buildDefault()
	{
		return this.build
		(
			// playersMax, arenaSize, planetSize, shipSize, bulletSize
			2, 128, 10, 3, 1
		);
	}
}