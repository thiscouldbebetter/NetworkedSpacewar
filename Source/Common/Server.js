
class Server
{
	constructor
	(
		portToListenOn,
		areAnonymousUsersAllowed,
		hasher,
		socketIo,
		usersKnown,
		world
	)
	{
		this.portToListenOn = portToListenOn;
		this.areAnonymousUsersAllowed = areAnonymousUsersAllowed;
		this.hasher = hasher;
		this.socketIo = socketIo;
		this.usersKnown = usersKnown;
		this.world = world;

		this.usersKnownByName =
			ArrayHelper.addLookupsByName(this.usersKnown);
	}

	areUserNameAndPasswordValid
	(
		userName, userPassword
	)
	{
		var areUserNameAndPasswordValid =
		(
			this.usersKnownByName.has(userName)
			&&
				this.usersKnownByName.get(userName).isPasswordValid
				(
					this.hasher, userPassword
				)
		);

		return areUserNameAndPasswordValid;
	}

	authenticateUserNameAndPassword(clientId, userName, userPassword)
	{
		var wasAuthenticationSuccessful =
			this.areAnonymousUsersAllowed
			|| this.areUserNameAndPasswordValid(userName, userPassword)

		if (wasAuthenticationSuccessful == false)
		{
			var errorMessage =
				"Invalid username or password for name: " + userName;
			console.log(errorMessage);

			var clientConnection =
				this.clientConnectionsById.get(clientId);
			clientConnection.errorMessageSend(errorMessage);
		}

		return wasAuthenticationSuccessful;
	}

	clientConnectReceive(socketToClient)
	{
		var clientId = "C_" + IDHelper.Instance().idNext();

		var clientConnection =
			new ClientConnection(this, clientId, socketToClient);

		this.clientConnections.push(clientConnection);
		this.clientConnectionsById.set(clientId, clientConnection);

		clientConnection.clientIdSend();
	}

	initialize()
	{
		this.clientConnections = [];
		this.clientConnectionsById = new Map();

		Log.IsEnabled = true;

		this.serializer = new Serializer();

		this.clientID = IDHelper.Instance().idNext();

		this.updatesIncoming = [];

		var io = this.socketIo.listen
		(
			this.portToListenOn,
			{ log: false }
		);

		io.sockets.on
		(
			"connection", this.clientConnectReceive.bind(this)
		);

		console.log("Server started at " + new Date().toLocaleTimeString());
		console.log
		(
			"Anoymous users are "
			+ (this.areAnonymousUsersAllowed ? "" : "NOT ")
			+ "allowed."
		);
		console.log("World:" + JSON.stringify(this.world));
		console.log("Listening on port " + this.portToListenOn + "...");

		setInterval
		(
			this.updateForTick.bind(this),
			this.world.millisecondsPerTick()
		);
	}

	updateForTick()
	{
		var world = this.world;

		world.updateForTick_UpdatesApply(this.updatesIncoming);
		world.updateForTick_Spawn();
		this.updateForTick_Server();
		world.updateForTick_UpdatesApply(world.updatesImmediate);
		world.updateForTick_Remove();
		this.updateForTick_UpdatesOutgoingSend();
	}

	updateForTick_Server()
	{
		var world = this.world;
		var bodies = world.bodies;

		for (var i = 0; i < bodies.length; i++)
		{
			var body = bodies[i];
			body.updateForTick_Integrity(world);
			body.updateForTick_Actions(world);
			body.updateForTick_Physics(world);
		}

		for (var i = 0; i < bodies.length; i++)
		{
			var body = bodies[i];
			body.updateForTick_Collisions(world, i);
		}
	}

	updateForTick_UpdatesOutgoingSend()
	{
		var world = this.world;

		var updates = world.updatesOutgoing;
		for (var i = 0; i < updates.length; i++)
		{
			var update = updates[i];
			var serializer = (update.serialize == null ? this.serializer : update);
			var updateSerialized = serializer.serialize(update);

			for (var c = 0; c < this.clientConnections.length; c++)
			{
				var clientConnection = this.clientConnections[c];
				clientConnection.updateSerializedSend(updateSerialized);
			}
		}
		updates.length = 0;
	}

}
