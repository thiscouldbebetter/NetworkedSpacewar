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

		this.socketToServer.on
		(
			"connected", 
			this.handleEvent_ServerConnected.bind(this)
		);

		this.socketToServer.on
		(
			"serverError", // A bad name, but "error" seems to be reserved.
			this.handleEvent_ServerError.bind(this)
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
			this.socketToServer.emit("update", updateSerialized);
		}
		world.updatesOutgoing.length = 0;
	}

	// events

	handleEvent_ServerConnected(clientID)
	{
		this.clientID = clientID;

		var clientNameColonPassword =
			this.clientName + ":" + this.clientPassword;

		this.socketToServer.emit("identify", clientNameColonPassword);

		this.socketToServer.on
		(
			"sessionEstablished", 
			this.handleEvent_SessionEstablished.bind(this)
		);
	}

	handleEvent_ServerError(errorMessage)
	{
		alert("Server error: " + errorMessage);
	}

	handleEvent_SessionEstablished(sessionSerialized)
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
			"update", 
			this.handleEvent_UpdateReceived.bind(this)
		);

		this.timer = setInterval
		(
			this.updateForTick.bind(this),
			world.millisecondsPerTick()
		);
	}

	handleEvent_UpdateReceived(updateSerialized)
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
}
