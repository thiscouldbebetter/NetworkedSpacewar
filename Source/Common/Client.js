
class Client
{
	constructor(socketProvider)
	{
		this.socketProvider = socketProvider;
	}

	// methods

	clientIdentifySend(userNameColonPassword)
	{
		this.socketProvider.emit("identify", userNameColonPassword);
	}

	clientDisconnectSend()
	{
		this.socketProvider.emit("disconnect");
		this.closeSocketKillDisplayAndShowMessage
		(
			"Client disconnected from server."
		);
	}

	closeSocketKillDisplayAndShowMessage(message)
	{
		this.socketProvider.close();
		if (this.display != null)
		{
			this.display.finalize(document);
		}
		alert(message);
	}

	connect(serviceURLToConnectTo, userName, userPassword)
	{
		this.serviceURL = serviceURLToConnectTo;
		this.userName = userName;
		this.userPassword = userPassword;

		if (this.socketProvider.isConnected())
		{
			this.socketProvider.disconnect();
		}

		this.socketProvider.connect
		(
			this.serviceURL,
			this.serverConnectReceived.bind(this),
			this.serverConnectErrorReceived.bind(this),
			this.serverErrorReceived.bind(this),
		);

		/*
		// fix - These calls have to come after connect for live sockets, but before for mock!
		this.serverConnectListen();
		this.serverConnectErrorListen();
		this.serverErrorListen();
		*/
	}

	isConnected()
	{
		var returnValue = this.socketProvider.isConnected();
		return returnValue;
	}

	serverConnectReceived()
	{
		var userNameColonPassword =
			this.userName + ":" + this.userPassword;

		this.sessionSerializedListen();

		this.clientIdentifySend(userNameColonPassword);
	}

	serverConnectErrorReceived(e)
	{
		// todo - Probably need to add retry attempts.
		var message = "Error connecting to server!";
		this.closeSocketKillDisplayAndShowMessage(message);
	}

	serverDisconnectListen()
	{
		this.socketProvider.on
		(
			"disconnect", this.serverDisconnectReceived.bind(this)
		);
	}

	serverDisconnectReceived(errorMessage)
	{
		var message = "Server disconnected!";
		this.closeSocketKillDisplayAndShowMessage(message);
	}

	serverErrorReceived(errorMessage)
	{
		var message = "Server error: " + errorMessage;
		this.closeSocketKillDisplayAndShowMessage(message);
	}

	sessionSerializedListen()
	{
		this.socketProvider.on
		(
			"sessionEstablished", 
			this.sessionSerializedReceived.bind(this)
		);
	}

	sessionSerializedReceived(socketProvider, sessionSerialized)
	{
		this.serializer = new Serializer();

		var session = this.serializer.deserialize(sessionSerialized);

		this.session = session;
		var world = this.session.world.initialize();

		this.universe = new Universe(world).initialize();

		this.updatesIncoming = []; 

		this.updateSerializedListen();

		this.timer = setInterval
		(
			this.updateForTick.bind(this),
			world.millisecondsPerTick()
		);
	}

	updateForTick()
	{
		var world = this.session.world;

		world.updateForTick_UpdatesApply(this.updatesIncoming);

		world.updateForTick_RemoveEntities();

		world.entitiesSpawn();

		this.updateForTick_Client();

		this.updateForTick_UpdatesOutgoingSend();
	}

	updateForTick_Client()
	{
		var universe = this.universe;
		var world = universe.world;

		var entityForUser = world.entityById
		(
			this.session.idOfEntityControlledByUser
		);

		if (entityForUser != null)
		{
			var activity = entityForUser.activity;

			activity.perform
			(
				universe, world, entityForUser, activity
			);
		}

		world.drawToDisplay(universe.display);
	}

	updateForTick_UpdatesOutgoingSend()
	{
		var world = this.session.world;

		for (var i = 0; i < world.updatesOutgoing.length; i++)
		{
			var update = world.updatesOutgoing[i];
			var updateSerialized = update.serialize(this.serializer);
			this.updateSerializedSend(updateSerialized);
		}
		world.updatesOutgoing.length = 0;
	}

	updateSerializedListen()
	{
		this.socketProvider.on
		(
			"", this.updateSerializedReceive.bind(this)
		);
	}

	updateSerializedReceive(socketProvider, updateSerialized)
	{
		var update =
			Update.deserialize(updateSerialized, this.serializer);
		this.updatesIncoming.push(update);
	}

	updateSerializedSend(updateSerialized)
	{
		this.socketProvider.emit("", updateSerialized);
	}
}
