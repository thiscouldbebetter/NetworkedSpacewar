
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

		this.updateSerializedListen();

		this.clientDisconnectListen();

		console.log(userName + " joined the server.");
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

	updateSerializedListen()
	{
		this.socket.on
		(
			"update", this.updateSerializedReceive.bind(this)
		);
	}

	updateSerializedReceive(updateSerialized)
	{
		var serializer;
		var firstChar = updateSerialized[0];
		if (firstChar == "{") // JSON
		{
			serializer = this.server.serializer;
		}
		else // terse
		{
			var updateCode = firstChar;
			if (updateCode == Update_Actions.updateCode())
			{
				serializer = new Update_Actions();
			}
		}

		var update = serializer.deserialize
		(
			updateSerialized
		);

		update.updateWorld(this.server.world);
	}

	updateSerializedSend(updateSerialized)
	{
		this.socket.emit("update", updateSerialized);
	}

}
