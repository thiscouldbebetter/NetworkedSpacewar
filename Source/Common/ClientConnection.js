
class ClientConnection
{
	constructor(server, bodyId, socket)
	{
		this.server = server;
		this.bodyId = bodyId;
		this.socket = socket;

		this.clientIdentifyListen();
	}

	clientIdSend()
	{
		this.socket.emit("connected", this.bodyId);
	}

	clientDisconnectListen()
	{
		this.socket.on
		(
			"disconnect", this.clientDisconnectReceive.bind(this)
		);
	}

	clientDisconnectReceive(e)
	{
		var world = this.server.universe.world;
		var bodyToDestroy = world.bodyById(this.bodyId);
		if (bodyToDestroy == null)
		{
			console.log(this.userName + " left the server.");
		}
		else
		{
			bodyToDestroy.integrity = 0;
			console.log(bodyToDestroy.name + " left the server.");
		}
	}

	clientIdentifyListen()
	{
		this.socket.on
		(
			"identify", this.clientIdentifyReceive.bind(this)
		);
	}

	clientIdentifyReceive(userNameColonPassword)
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

			var bodyDefnForClient = this.bodyDefnForClientBuild(world);

			var updateBodyDefnRegister = new Update_BodyDefnRegister
			(
				bodyDefnForClient
			);
			updateBodyDefnRegister.updateWorld(world);
			world.updatesOutgoing.push(updateBodyDefnRegister);

			var bodyForClient =
				this.bodyForClientBuild(world, userName, bodyDefnForClient);

			var session = new Session(bodyForClient.id, world);
			var sessionSerialized = server.serializer.serialize(session);
			this.sessionSerializedSend(sessionSerialized);

			var updateBodyCreate = new Update_BodyCreate(bodyForClient);
			world.updatesOutgoing.push(updateBodyCreate);
			updateBodyCreate.updateWorld(world);

			this.clientDisconnectListen();
			this.updateSerializedListen();

			console.log(userName + " joined the server.");
		}
	}

	bodyDefnForClientBuild(world)
	{
		var bodyDefnPlayer = world.bodyDefnsByName.get("_Player");
		var bodyDefnForClient = bodyDefnPlayer.clone();
		bodyDefnForClient.name = this.userName;
		bodyDefnForClient.color = ColorHelper.random();
		return bodyDefnForClient;
	}

	bodyForClientBuild(world, userName, bodyDefnForClient)
	{
		var posRandom = new Coords().randomize().multiply(world.size);
		var forwardInTurnsRandom = Math.random();
		var locRandom = new Location
		(
			posRandom, forwardInTurnsRandom
		);

		var bodyForClient = new Body
		(
			world.bodies.length, // bodyId
			userName, // name
			bodyDefnForClient.name,
			locRandom
		);

		return bodyForClient;
	}

	errorMessageSend(errorMessage)
	{
		this.socket.emit("serverError", errorMessage);
	}

	sessionSerializedSend(sessionSerialized)
	{
		this.socket.emit("sessionEstablished", sessionSerialized);
	}

	updateSerializedListen()
	{
		this.socket.on
		(
			"", this.updateSerializedReceive.bind(this)
		);
	}

	updateSerializedReceive(updateAsBytes)
	{
		var bitStream = new BitStream(updateAsBytes);
		var update = Update.readFromBitStream(bitStream);
		update.bodyId = this.bodyId; // Necessary?

		update.updateWorld(this.server.universe.world);
	}

	updateSerializedSend(updateSerialized)
	{
		this.socket.emit("", updateSerialized);
	}

}
