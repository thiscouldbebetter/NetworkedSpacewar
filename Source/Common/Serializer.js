
function Serializer()
{
	// do nothing
}

{
	Serializer.prototype.deserialize = function(stringToDeserialize)
	{
		var nodeRoot = JSON.parse(stringToDeserialize);
		nodeRoot.__proto__ = SerializerNode.prototype;
		nodeRoot.prototypesAssign();
		var returnValue = nodeRoot.unwrap([]);

		return returnValue;
	};

	Serializer.prototype.serialize = function(objectToSerialize)
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
	};
}
