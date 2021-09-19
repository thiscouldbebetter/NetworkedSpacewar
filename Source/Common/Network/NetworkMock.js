
class NetworkMock
{
	constructor(nodes)
	{
		this.nodes = nodes;
		this.nodesByName = new Map(this.nodes.map(x => [x.name, x]));
	}

	messageSend(messageToSend)
	{
		var nodeTo = this.nodeByName(messageToSend.nodeToName)
		nodeTo.messageReceive(nodeTo, messageToSend);
	}

	nodeByName(nodeName)
	{
		return this.nodesByName.get(nodeName);
	}
}