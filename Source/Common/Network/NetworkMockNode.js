
class NetworkMockNode
{
	constructor(name, messageReceive)
	{
		this.name = name;
		this._messageReceive = messageReceive;
	}

	messageReceive(networkNode, messageReceived)
	{
		networkNode._messageReceive(networkNode, messageReceived);
	}
}
