
class Update_Group
{
	constructor(children)
	{
		this.children = children;
	}

	updateWorld(world)
	{
		for (var i = 0; i < this.children.length; i++)
		{
			var child = this.children[i];
			child.updateWorld(world);
		}
	}

	// Serialization.

	// BitStream

	readFromBitStream(bitStream)
	{
		this.children.length = 0;

		var childCount = bitStream.readBitsAsNumberUnsigned(4);

		for (var i = 0; i < childCount; i++)
		{
			var child = Update.readFromBitStream(bitStream);
			children.push(child);
		}

		var returnValue = new Update_Group(children);

		return returnValue;
	}

	writeToBitStream(bitStream)
	{
		bitStream.writeNumberUsingBitWidth
		(
			this.children.length, 4
		);

		for (var i = 0; i < this.children.length; i++);
		{
			var child = this.children[i];
			child.writeToBitStream(bitStream)
		}
	}
}
