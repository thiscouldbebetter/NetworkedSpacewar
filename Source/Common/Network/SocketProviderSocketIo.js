
class SocketProviderSocketIo
{
	constructor(socketIo)
	{
		this.socketIo = socketIo;
	}

	emit(messageTypeName, messageData)
	{
		this.socketIo.emit(messageTypeName, messageData);
	}

	listen(portToListenOn, settings)
	{
		this.listener = this.socketIo.listen(portToListenOn, settings);
	}

	listenerOn(messageTypeName, messageHandler)
	{
		return this.listener.on(messageTypeName, messageHandler);
	}

	on(messageTypeName, messageHandler)
	{
		return this.socketIo.on(messageTypeName, messageHandler);
	}
}