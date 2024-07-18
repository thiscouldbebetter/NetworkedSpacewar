
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
		var server = this;
		this.socketProvider.on
		(
			"connection",
			(socketProvider, connectData) =>
			{
				var socketProviderToClient =
					server.socketProvider.childFromConnectData(connectData);

				this.clientConnectReceive(socketProviderToClient);
			}
		);
	}

	clientConnectReceive(socketProviderToClient)
	{
		var world = this.universe.world;

		var entityId = world.entityIdNext();

		var clientConnection =
			new ClientConnection(this, entityId, socketProviderToClient);

		this.clientConnections.push(clientConnection);

		clientConnection.clientIdSend();
	}

	initialize()
	{
		this.clientConnections = [];

		Log.IsEnabled = true;

		this.serializer = new Serializer();

		this.updatesIncoming = [];

		console.log("Server started at " + new Date().toLocaleTimeString());

		this.socketProvider.listen
		(
			this.portToListenOn,
			{ log: false }
		);

		this.clientConnectListen();

		console.log("Listening on port " + this.portToListenOn + "...");

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

	socketProviderByClientName(clientName)
	{
		var clientConnection =
			this.clientConnections.filter(
				x => x.socketProvider.clientNameIs(clientName)
			)[0];

		var returnValue =
		(
			clientConnection == null
			? this.socketProvider
			: clientConnection.socketProvider
		);
		return returnValue;
	}

	updateForTick()
	{
		var world = this.universe.world;

		world.updateForTick_UpdatesApply(this.updatesIncoming);
		world.entitiesSpawn();
		this.updateForTick_UpdateEntityIntegrityActionsAndPhysics();
		world.updateForTick_UpdatesApply(world.updatesImmediate);
		world.updateForTick_RemoveEntities();
		this.updateForTick_UpdatesOutgoingSend();
	}

	updateForTick_UpdateEntityIntegrityActionsAndPhysics()
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
