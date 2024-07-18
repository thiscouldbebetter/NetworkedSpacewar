
class WorldDefnChess
{
	entityDefnForClientBuild(world, userName)
	{
		var entityDefnPlayer = world.entityDefnByName("Player");
		var entityDefnForClient = entityDefnPlayer.clone();
		entityDefnForClient.name = userName;
		entityDefnForClient.color = ColorHelper.random();
		return entityDefnForClient;
	}

	entityForClientBuild(world, userName, entityDefnForClient)
	{
		var posRandom = new Coords().randomize().multiply(world.size);
		var forwardInTurnsRandom = Math.random();
		var locRandom = new Location
		(
			posRandom, forwardInTurnsRandom
		);

		var entityForClient = new Entity
		(
			world.entities.length, // entityId
			userName, // name
			entityDefnForClient.name,
			locRandom
		);

		return entityForClient;
	}

}