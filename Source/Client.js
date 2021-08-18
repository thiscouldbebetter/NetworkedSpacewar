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

	clientIdentifySend(clientNameColonPassword)
	{
		this.socketToServer.emit("identify", clientNameColonPassword);
	}

	clientDisconnectSend()
	{
		this.socketToServer.emit("disconnect");
		this.closeSocketKillDisplayAndShowMessage("Client disconnected from server.");
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

	connect(serviceURLToConnectTo, clientName, clientPassword)
	{
		this.serviceURL = serviceURLToConnectTo;
		this.clientName = clientName;
		this.clientPassword = clientPassword;

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

	serverConnectReceived(clientID)
	{
		this.clientID = clientID;

		var clientNameColonPassword =
			this.clientName + ":" + this.clientPassword;

		this.clientIdentifySend(clientNameColonPassword);

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
		alert("Server error: " + errorMessage);
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

		this.display = new Display("divDisplay", world.size);
		this.display.initialize(document);

		this.inputHelper = new InputHelper();
		this.inputHelper.initialize(document, this.display);

		this.updatesIncoming = []; 

		this.socketToServer.on
		(
			"update", this.updateSerializedReceived.bind(this)
		);

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
		var world = this.session.world;

		var bodyForUser = world.bodiesByName.get
		(
			this.session.idOfBodyControlledByUser
		);

		if (bodyForUser != null)
		{
			var activity = bodyForUser.activity;

			activity.perform
			(
				world, this.inputHelper, bodyForUser, activity
			);
		}

		world.drawToDisplay(this.display);
	}

	updateForTick_UpdatesOutgoingSend()
	{
		var world = this.session.world;

		for (var i = 0; i < world.updatesOutgoing.length; i++)
		{
			var update = world.updatesOutgoing[i];
			var serializer = (update.serialize == null ? this.serializer : update);
			var updateSerialized = serializer.serialize(update);
			this.updateSerializedSend(updateSerialized);
		}
		world.updatesOutgoing.length = 0;
	}

	updateSerializedReceived(updateSerialized)
	{
		var serializer;
		var firstChar = updateSerialized[0];
		
		if (firstChar == "{") // JSON
		{
			serializer = this.serializer;
		}
		else // terse
		{
			var updateCode = firstChar;
			if (updateCode == Update_Physics.updateCode())
			{
				serializer = new Update_Physics();
			}
		}

		var update = serializer.deserialize(updateSerialized);

		this.updatesIncoming.push(update);
	}

	updateSerializedSend(updateSerialized)
	{
		this.socketToServer.emit("update", updateSerialized);
	}
}
