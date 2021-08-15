
class Serializer
{
	deserialize(stringToDeserialize)
	{
		var nodeRoot = JSON.parse(stringToDeserialize);
		nodeRoot.__proto__ = SerializerNode.prototype;
		nodeRoot.prototypesAssign();
		var returnValue = nodeRoot.unwrap([]);

		return returnValue;
	}

	serialize(objectToSerialize)
	{
		var nodeRoot = new SerializerNode(objectToSerialize);

		nodeRoot.wrap([], []);

		var nodeRootSerialized = JSON.stringify
		(
			nodeRoot,
			null, // ?
			4 // pretty-print indent size
		);

		return nodeRootSerialized;
	}
}
