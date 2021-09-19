
class ClientConnection
{
	constructor(server, entityId, socketProvider)
	{
		this.server = server;
		this.entityId = entityId;
		this.socketProvider = socketProvider;

		this.clientIdentifyListen();
	}

	clientIdSend()
	{
		this.socketProvider.emit("connected", this.entityId);
	}

	clientDisconnectListen()
	{
		this.socketProvider.on
		(
			"disconnect", this.clientDisconnectReceive.bind(this)
		);
	}

	clientDisconnectReceive(e)
	{
		var world = this.server.universe.world;
		var entityToDestroy = world.entityById(this.entityId);
		if (entityToDestroy == null)
		{
			console.log(this.userName + " left the server.");
		}
		else
		{
			entityToDestroy.integrity = 0;
			console.log(entityToDestroy.name + " left the server.");
		}
	}

	clientIdentifyListen()
	{
		this.socketProvider.on
		(
			"identify", this.clientIdentifyReceive.bind(this)
		);
	}

	clientIdentifyReceive(socketProvider, userNameColonPassword)
	{
		var server = this.server;

		var userNameAndPassword = userNameColonPassword.split(":");
		var userName = userNameAndPassword[0];
		var userPassword = userNameAndPassword[1];

		this.userName = userName;

		var isAuthenticationValid = server.authenticateUserNameAndPassword
		(
			userName, userPassword, this
		);

		if (isAuthenticationValid == false)
		{
			// todo
		}
		else if (server.isUserWithNameConnected(userName))
		{
			// todo - Disconnect the user?
			this.errorMessageSend
			(
				"The user '" + userName + "' is already connected."
			);
		}
		else
		{
			this.userName = userName;

			var world = server.universe.world;

			var entityDefnForClient = this.entityDefnForClientBuild(world);

			var updateEntityDefnRegister = new Update_EntityDefnRegister
			(
				entityDefnForClient
			);
			updateEntityDefnRegister.updateWorld(world);
			world.updatesOutgoing.push(updateEntityDefnRegister);

			var entityForClient =
				this.entityForClientBuild(world, userName, entityDefnForClient);

			var session = new Session(entityForClient.id, world);
			var sessionSerialized = server.serializer.serialize(session);
			this.sessionSerializedSend(sessionSerialized);

			var updateEntityCreate = new Update_EntityCreate(entityForClient);
			world.updatesOutgoing.push(updateEntityCreate);
			updateEntityCreate.updateWorld(world);

			this.clientDisconnectListen();
			this.updateSerializedListen();

			console.log(userName + " joined the server.");
		}
	}

	entityDefnForClientBuild(world)
	{
		var entityDefnPlayer = world.entityDefnsByName.get("_Player");
		var entityDefnForClient = entityDefnPlayer.clone();
		entityDefnForClient.name = this.userName;
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

	errorMessageSend(errorMessage)
	{
		this.socketProvider.emit("serverError", errorMessage);
	}

	sessionSerializedSend(sessionSerialized)
	{
		this.socketProvider.emit("sessionEstablished", sessionSerialized);
	}

	updateSerializedListen()
	{
		this.socketProvider.on
		(
			"",
			(socketProvider, updateSerialized) =>
			{
				this.updateSerializedReceive(updateSerialized);
			}
		);
	}

	updateSerializedReceive(updateAsBytes)
	{
		var bitStream = new BitStream(updateAsBytes);
		var update = Update.readFromBitStream(bitStream);
		update.entityId = this.entityId; // Necessary?

		update.updateWorld(this.server.universe.world);
	}

	updateSerializedSend(updateSerialized)
	{
		this.socketProvider.emit("", updateSerialized);
	}

}
