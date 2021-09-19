
class SocketProviderMock
{
	constructor(network, networkNodeFromName, networkNodeToName)
	{
		this.network = network;
		this.networkNodeFromName = networkNodeFromName;
		this.networkNodeToName = networkNodeToName;

		this.messageHandlersByTypeName = new Map();
		this._isConnected = false;
	}

	messageReceive(messageReceived)
	{
		var messageTypeName = messageReceived.typeName;
		var messageHandler =
			this.messageHandlersByTypeName.get(messageTypeName);

		if (messageHandler == null)
		{
			console.log("No handler registered for message type name: " + messageTypeName);
		}
		else
		{
			messageHandler(this, messageReceived.content);
		}
	}

	clone()
	{
	}

	// SocketProvider.

	childFromConnectData(connectData)
	{
		var clientName = connectData;

		var returnValue = new SocketProviderMock
		(
			this.network, this.networkFromNodeName, clientName
		);

		return returnValue;
	}

	clientNameIs(clientName)
	{
		return (this.networkNodeToName == clientName);
	}

	close()
	{
		// todo
	}

	connect
	(
		urlToConnectTo,
		serverConnectReceived,
		serverConnectErrorReceived,
		serverErrorReceived
	)
	{
		this.networkNodeToName = urlToConnectTo;

		this.on("connected", serverConnectReceived);
		this.on("connect_error", serverConnectErrorReceived);
		this.on("serverError", serverErrorReceived);

		var message = new NetworkMockMessage
		(
			this.networkNodeFromName, // from
			this.networkNodeToName, // to
			"connection",
			this.networkNodeFromName // content
		);
		this.network.messageSend(message);

		return this;
	}

	emit(messageTypeName, messageData)
	{
		var message = new NetworkMockMessage
		(
			this.networkNodeFromName,
			this.networkNodeToName,
			messageTypeName,
			messageData
		);
		this.network.messageSend(message);
	}

	isConnected()
	{
		return this._isConnected;
	}

	listen(portToListenOn, settings)
	{
		this.messageHandlersByTypeName.set
		(
			"connection",
			(socketProvider, messageReceived) =>
			{
				socketProvider._isConnected = true;
				var messageConnected = new NetworkMockMessage
				(
					messageReceived.nodeToName, // from
					messageReceived.nodeFromName, // to
					"connected",
					"todo"
				);
				this.network.messageSend(messageConnected);
			}
		);
	}

	on(messageTypeName, messageHandler)
	{
		this.messageHandlersByTypeName.set(messageTypeName, messageHandler);
	}
}