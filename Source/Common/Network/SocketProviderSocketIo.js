
class SocketProviderSocketIo
{
	constructor(socketIo)
	{
		this.socketIo = socketIo;
	}

	// SocketProvider.

	childFromConnectData(connectData)
	{
		var socketIoSocket = connectData;

		var returnValue = new SocketProviderSocketIo(this.socketIo);
		returnValue.socket = socketIoSocket;

		return returnValue;
	}

	clientNameIs(clientName)
	{
		throw("todo");
	}

	close()
	{
		this.socket.close();
	}

	connect
	(
		urlToConnectTo,
		serverConnectReceived,
		serverConnectErrorReceived,
		serverErrorReceived
	)
	{
		this.socket = this.socketIo.connect(urlToConnectTo);

		this.socket.on("connected", serverConnectReceived);
		this.socket.on("connect_error", serverConnectErrorReceived);
		this.socket.on("serverError", serverErrorReceived);

		return this.socket;
	}

	emit(messageTypeName, messageData)
	{
		this.socket.emit(messageTypeName, messageData);
	}

	isConnected()
	{
		return (this.socket != null && this.socket.connected);
	}

	listen(portToListenOn, settings)
	{
		this.socket = this.socketIo.listen(portToListenOn, settings);
	}

	on(messageTypeName, messageHandler)
	{
		return this.socket.on
		(
			messageTypeName,
			(socketIoSocket) => messageHandler(this, socketIoSocket)
		);
	}
}