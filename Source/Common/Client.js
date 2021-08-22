class Client
{
	static Instance()
	{
		if (Client._instance == null)
		{
			Client._instance = new Client();
		}
		return Client._instance;
	}

	// methods

	clientIdentifySend(userNameColonPassword)
	{
		this.socketToServer.emit("identify", userNameColonPassword);
	}

	clientDisconnectSend()
	{
		this.socketToServer.emit("disconnect");
		this.closeSocketKillDisplayAndShowMessage
		(
			"Client disconnected from server."
		);
	}

	closeSocketKillDisplayAndShowMessage(message)
	{
		this.socketToServer.close();
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

		if (this.socketToServer != null)
		{
			this.socketToServer.disconnect();
			this.socketToServer = null;
		}

		this.socketToServer = io.connect(this.serviceURL);

		this.serverConnectListen();
		this.serverConnectErrorListen();
		this.serverErrorListen();
	}

	isConnected()
	{
		var returnValue =
		(
			this.socketToServer != null && this.socketToServer.connected
		);
		return returnValue;
	}

	serverConnectListen()
	{
		this.socketToServer.on
		(
			"connected", this.serverConnectReceived.bind(this)
		);
	}

	serverConnectReceived(bodyId)
	{
		this.bodyId = bodyId;

		var userNameColonPassword =
			this.userName + ":" + this.userPassword;

		this.clientIdentifySend(userNameColonPassword);

		this.sessionSerializedListen();
	}

	serverConnectErrorListen()
	{
		this.socketToServer.on
		(
			"connect_error", this.serverConnectErrorReceived.bind(this)
		);
	}

	serverConnectErrorReceived(e)
	{
		// todo - Probably need to add retry attempts.
		var message = "Error connecting to server!";
		this.closeSocketKillDisplayAndShowMessage(message);
	}

	serverDisconnectListen()
	{
		this.socketToServer.on
		(
			"disconnect", this.serverConnectReceived.bind(this)
		);
	}

	serverDisconnectReceived(errorMessage)
	{
		var message = "Server disconnected!";
		this.closeSocketKillDisplayAndShowMessage(message);
	}

	serverErrorListen()
	{
		this.socketToServer.on
		(
			"serverError", // A bad name, but "error" seems to be reserved.
			this.serverErrorReceived.bind(this)
		);
	}

	serverErrorReceived(errorMessage)
	{
		var message = "Server error: " + errorMessage;
		this.closeSocketKillDisplayAndShowMessage(message);
	}

	sessionSerializedListen()
	{
		this.socketToServer.on
		(
			"sessionEstablished", 
			this.sessionSerializedReceived.bind(this)
		);
	}

	sessionSerializedReceived(sessionSerialized)
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

		world.updateForTick_Remove();

		world.updateForTick_Spawn();

		this.updateForTick_Client();

		this.updateForTick_UpdatesOutgoingSend();
	}

	updateForTick_Client()
	{
		var universe = this.universe;
		var world = universe.world;

		var bodyForUser = world.bodyById
		(
			this.session.idOfBodyControlledByUser
		);

		if (bodyForUser != null)
		{
			var activity = bodyForUser.activity;

			activity.perform
			(
				universe, world, bodyForUser, activity
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
		this.socketToServer.on
		(
			"", this.updateSerializedReceived.bind(this)
		);
	}

	updateSerializedReceived(updateSerialized)
	{
		var update =
			Update.deserialize(updateSerialized, this.serializer);
		this.updatesIncoming.push(update);
	}

	updateSerializedSend(updateSerialized)
	{
		this.socketToServer.emit("", updateSerialized);
	}
}
