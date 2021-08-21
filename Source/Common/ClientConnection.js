
class ClientConnection
{
	constructor(server, clientId, socket)
	{
		this.server = server;
		this.clientId = clientId;
		this.socket = socket;

		this.clientIdentifyListen();
	}

	clientIdSend()
	{
		this.socket.emit("connected", this.clientId);
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
		var bodiesByName = this.server.world.bodiesByName;
		var bodyToDestroy = bodiesByName.get(this.clientId);
		if (bodyToDestroy == null)
		{
			console.log(this.clientId + " left the server.");
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

		var isAuthenticationValid = server.authenticateUserNameAndPassword
		(
			this.clientId, userName, userPassword
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
			this.clientName = userName;

			var session = new Session(this.clientId, server.world);
			var sessionSerialized = server.serializer.serialize(session);
			this.sessionSerializedSend(sessionSerialized);

			var world = server.world;

			var bodyDefnForClient = this.bodyDefnForClientBuild(world);

			var updateBodyDefnRegister = new Update_BodyDefnRegister
			(
				bodyDefnForClient
			);
			updateBodyDefnRegister.updateWorld(world);
			world.updatesOutgoing.push(updateBodyDefnRegister);

			var bodyForClient =
				this.bodyForClientBuild(world, userName, bodyDefnForClient);

			var updateBodyCreate = new Update_BodyCreate(bodyForClient);
			world.updatesOutgoing.push(updateBodyCreate);
			updateBodyCreate.updateWorld(world);

			this.updateSerializedAsBinaryStringListen();
			this.updateSerializedAsJsonListen();

			this.clientDisconnectListen();

			console.log(userName + " joined the server.");
		}
	}

	bodyDefnForClientBuild(world)
	{
		var bodyDefnPlayer = world.bodyDefnsByName.get("_Player");
		var bodyDefnForClient = bodyDefnPlayer.clone();
		bodyDefnForClient.name = this.clientId;
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
			this.clientId, // id
			userName, // name
			bodyDefnForClient.name,
			locRandom
		);

		return bodyForClient
	}

	errorMessageSend(errorMessage)
	{
		this.socket.emit("serverError", errorMessage);
	}

	sessionSerializedSend(sessionSerialized)
	{
		this.socket.emit("sessionEstablished", sessionSerialized);
	}

	updateSerializedAsBinaryStringListen()
	{
		this.socket.on
		(
			"", this.updateSerializedAsBinaryStringReceive.bind(this)
		);
	}

	updateSerializedAsBinaryStringReceive(updateSerialized)
	{
		var updateAsBytes =
			ByteHelper.binaryStringToBytes(updateSerialized);
		var bitStream = new BitStream(updateAsBytes);
		var update = Update.readFromBitStream(bitStream);
console.log(JSON.stringify(update));
		update.bodyId = this.clientId; // Necessary?

		update.updateWorld(this.server.world);
	}

	updateSerializedAsJsonListen()
	{
		this.socket.on
		(
			"updateSerializedAsJson",
			this.updateSerializedAsJsonReceive.bind(this)
		);
	}

	updateSerializedAsJsonReceive(updateSerialized)
	{
		var serializer = this.server.serializer;
		var update = serializer.deserialize
		(
			updateSerialized
		);

		update.updateWorld(this.server.world);
	}

	updateSerializedAsBinaryStringSend(updateSerialized)
	{
		this.socket.emit("", updateSerialized);
	}

	updateSerializedAsJsonSend(updateSerialized)
	{
		this.socket.emit("updateSerializedAsJson", updateSerialized);
	}

}
