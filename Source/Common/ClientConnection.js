
class ClientConnection
{
	constructor(server, clientID, socket)
	{
		this.server = server;
		this.clientID = clientID;
		this.socket = socket;

		this.socket.on
		(
			"identify", 
			this.handleEvent_ClientIdentifyingSelf.bind(this)
		);
	}

	handleEvent_ClientDisconnected(e)
	{
		var bodiesByName = this.server.world.bodiesByName;
		var bodyToDestroy = bodiesByName.get(this.clientID);
		if (bodyToDestroy == null)
		{
			console.log(this.clientID + " left the server.");
		}
		else
		{
			bodyToDestroy.integrity = 0;
			console.log(bodyToDestroy.name + " left the server.");
		}
	}

	handleEvent_ClientIdentifyingSelf(clientNameColonPassword)
	{
		var server = this.server;

		var clientNameAndPassword = clientNameColonPassword.split(":");
		var clientName = clientNameAndPassword[0];
		var clientPassword = clientNameAndPassword[1];

		var usersKnownByName = server.usersKnownByName;
		var areUserAndPasswordValid =
		(
			usersKnownByName.has(clientName)
			&& usersKnownByName.get(clientName).isPasswordValid(clientPassword)
		);

		var clientConnection = server.clientConnections[this.clientID];
		var socketToClient = clientConnection.socket;

		if
		(
			server.areAnonymousUsersAllowed == false
			&& areUserAndPasswordValid == false
		)
		{
			var errorMessage =
				"Invalid username or password for name: " + clientName;
			console.log(errorMessage);
			socketToClient.emit("serverError", errorMessage);
			return;
		}

		this.clientName = clientName;

		var session = new Session(this.clientID, server.world);
		var sessionSerialized = server.serializer.serialize(session);
		socketToClient.emit("sessionEstablished", sessionSerialized);

		var world = server.world;
		var bodyDefnPlayer = world.bodyDefnsByName.get("_Player");
		var bodyDefnForClient = bodyDefnPlayer.clone();
		bodyDefnForClient.name = this.clientID;
		bodyDefnForClient.color = ColorHelper.random();

		var updateBodyDefnRegister = new Update_BodyDefnRegister
		(
			bodyDefnForClient
		);
		updateBodyDefnRegister.updateWorld(world);
		world.updatesOutgoing.push(updateBodyDefnRegister);

		var posRandom = new Coords().randomize().multiply(world.size);
		var forwardInTurnsRandom = Math.random();
		var locRandom = new Location
		(
			posRandom, forwardInTurnsRandom
		);

		var bodyForClient = new Body
		(
			this.clientID, // id
			clientName, // name
			bodyDefnForClient.name,
			locRandom
		);

		var updateBodyCreate = new Update_BodyCreate(bodyForClient);
		world.updatesOutgoing.push(updateBodyCreate);
		updateBodyCreate.updateWorld(world);

		socketToClient.on
		(
			"update",
			this.handleEvent_ClientUpdateReceived.bind(this)
		);

		socketToClient.on
		(
			"disconnect",
			this.handleEvent_ClientDisconnected.bind(this)
		);

		console.log(clientName + " joined the server.");
	}

	handleEvent_ClientUpdateReceived(updateSerialized)
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
}
