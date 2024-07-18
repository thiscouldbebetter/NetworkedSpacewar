
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
		else if (server.isUserWithNameConnected(userName) )
		{
			// todo - Disconnect the user?
			var errorMessage = "The user '" + userName + "' is already connected.";
			console.log(errorMessage);
			this.errorMessageSend(errorMessage);
		}
		else
		{
			this.userName = userName;

			var world = server.universe.world;

			var entityDefnForClient =
				world.entityDefnForClientBuild(userName);

			var entityForClient =
				world.entityForClientBuild(userName, entityDefnForClient);

			var updateEntityDefnRegister =
				new Update_EntityDefnRegister(entityDefnForClient);
			updateEntityDefnRegister.updateWorld(world);
			world.updatesOutgoing.push(updateEntityDefnRegister);

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
