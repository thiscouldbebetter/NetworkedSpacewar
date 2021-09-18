
class Server
{
	constructor
	(
		portToListenOn,
		areAnonymousUsersAllowed,
		hasher,
		socketProvider,
		usersKnown,
		universe
	)
	{
		this.portToListenOn = portToListenOn;
		this.areAnonymousUsersAllowed = areAnonymousUsersAllowed;
		this.hasher = hasher;
		this.socketProvider = socketProvider;
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
		this.socketProvider.listenerOn
		(
			"connection", this.clientConnectReceive.bind(this)
		);
	}

	clientConnectReceive(socketIoToClient)
	{
		var world = this.universe.world;
		var entityId = world.entities.length;

		var socketProvider = new SocketProviderSocketIo(socketIoToClient);

		var clientConnection =
			new ClientConnection(this, entityId, socketProvider);

		this.clientConnections.push(clientConnection);

		clientConnection.clientIdSend();
	}

	initialize()
	{
		this.clientConnections = [];

		Log.IsEnabled = true;

		this.serializer = new Serializer();

		this.updatesIncoming = [];

		this.socketProvider.listen
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
		var entities = world.entities;

		for (var i = 0; i < entities.length; i++)
		{
			var entity = entities[i];
			entity.updateForTick_Integrity(universe, world);
			entity.updateForTick_Actions(universe, world);
			entity.updateForTick_Physics(universe, world);
		}

		for (var i = 0; i < entities.length; i++)
		{
			var entity = entities[i];
			entity.updateForTick_Collisions(universe, world, i);
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
