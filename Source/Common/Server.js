
class Server
{
	constructor
	(
		portToListenOn,
		areAnonymousUsersAllowed,
		hasher,
		socketIo,
		usersKnown,
		universe
	)
	{
		this.portToListenOn = portToListenOn;
		this.areAnonymousUsersAllowed = areAnonymousUsersAllowed;
		this.hasher = hasher;
		this.socketIo = socketIo;
		this.usersKnown = usersKnown;
		this.universe = universe;

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

	authenticateUserNameAndPassword(userName, userPassword, clientConnection)
	{
		var wasAuthenticationSuccessful =
			this.areAnonymousUsersAllowed
			|| this.areUserNameAndPasswordValid(userName, userPassword)

		if (wasAuthenticationSuccessful == false)
		{
			var errorMessage =
				"Invalid username or password for name: " + userName;
			console.log(errorMessage);

			clientConnection.errorMessageSend(errorMessage);
		}

		return wasAuthenticationSuccessful;
	}

	clientConnectListen()
	{
		this.io.sockets.on
		(
			"connection", this.clientConnectReceive.bind(this)
		);
	}

	clientConnectReceive(socketToClient)
	{
		var world = this.universe.world;
		var bodyId = world.bodies.length;

		var clientConnection =
			new ClientConnection(this, bodyId, socketToClient);

		this.clientConnections.push(clientConnection);

		clientConnection.clientIdSend();
	}

	initialize()
	{
		this.clientConnections = [];

		Log.IsEnabled = true;

		this.serializer = new Serializer();

		this.updatesIncoming = [];

		this.io = this.socketIo.listen
		(
			this.portToListenOn,
			{ log: false }
		);

		this.clientConnectListen();

		console.log("Server started at " + new Date().toLocaleTimeString());
		console.log
		(
			"Anoymous users are "
			+ (this.areAnonymousUsersAllowed ? "" : "NOT ")
			+ "allowed."
		);

		var world = this.universe.world;

		var worldSerialized =
			JSON.stringify(world);
		console.log("World:" + worldSerialized);

		console.log("Listening on port " + this.portToListenOn + "...");

		setInterval
		(
			this.updateForTick.bind(this),
			world.millisecondsPerTick()
		);
	}

	isUserWithNameConnected(userNameToCheck)
	{
		var isUserConnected =
			this.clientConnections.some(x => false); // todo
		return isUserConnected; 
	}

	updateForTick()
	{
		var world = this.universe.world;

		world.updateForTick_UpdatesApply(this.updatesIncoming);
		world.updateForTick_Spawn();
		this.updateForTick_Server();
		world.updateForTick_UpdatesApply(world.updatesImmediate);
		world.updateForTick_Remove();
		this.updateForTick_UpdatesOutgoingSend();
	}

	updateForTick_Server()
	{
		var universe = this.universe;
		var world = universe.world;
		var bodies = world.bodies;

		for (var i = 0; i < bodies.length; i++)
		{
			var body = bodies[i];
			body.updateForTick_Integrity(universe, world);
			body.updateForTick_Actions(universe, world);
			body.updateForTick_Physics(universe, world);
		}

		for (var i = 0; i < bodies.length; i++)
		{
			var body = bodies[i];
			body.updateForTick_Collisions(universe, world, i);
		}
	}

	updateForTick_UpdatesOutgoingSend()
	{
		var world = this.universe.world;

		var updates = world.updatesOutgoing;
		for (var i = 0; i < updates.length; i++)
		{
			var update = updates[i];

			var updateSerialized = update.serialize(this.serializer);

			for (var c = 0; c < this.clientConnections.length; c++)
			{
				var clientConnection = this.clientConnections[c];
				clientConnection.updateSerializedSend
				(
					updateSerialized
				);
			}

		}
		updates.length = 0;
	}

}
