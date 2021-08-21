
class Update_Actions
{
	constructor(bodyIndex, actionCodes)
	{
		this.bodyIndex = bodyIndex;
		this.actionCodes = actionCodes;
	}

	updateWorld(world)
	{
		var body = world.bodiesByName.get(this.bodyId);

		if (body != null)
		{
			body.ticksSinceActionPerformed = 0;
			var bodyActivity = body.activity;
			var bodyActivityActionCodes = bodyActivity.actionCodes;
			bodyActivityActionCodes.length = 0;
			bodyActivityActionCodes.push(...this.actionCodes);
		}
	}

	// serialization

	deserialize(updateSerialized)
	{
		var bytes = ByteHelper.binaryStringToBytes(updateSerialized);
		var bitStream = new BitStream(bytes);
		var returnValue = new Update_Actions().readFromBitStream(bitStream);
		return returnValue;
	}

	serialize()
	{
		var bitStream = new BitStream();
		this.writeToBitStream(bitStream);
		var returnValue = ByteHelper.bytesToBinaryString(bitStream.bytes);
		return returnValue;
	}

	// bitStream

	readFromBitStream(bitStream)
	{
		var updateCode = bitStream.readBitsAsNumberUnsigned(3);

		var bodyIndex = bitStream.readBitsAsNumberUnsigned(2);

		var actionCount = 6;
		var actionIsActiveByCode = [];

		var actionCodes = [];

		for (var i = 0; i < actionCount; i++)
		{
			var isActionActive = (bitStream.readBit() == 1);

			if (isActionActive)
			{
				actionCodes.push(i);
			}
		}

		var returnValue = new Update_Actions
		(
			bodyIndex, actionCodes
		);

		return returnValue;
	}

	writeToBitStream(bitStream)
	{
		var updateCode = 0;
		bitStream.writeNumberUsingBitWidth(updateCode, 3);

		bitStream.writeNumberUsingBitWidth(this.bodyIndex, 2);

		var actionsAsNumber = 0;
		var actionCount = 6;

		for (var i = 0; i < actionCount; i++)
		{
			var isActionActive = (this.actionCodes.indexOf(i) >= 0);
			var bitToWrite = (isActionActive ? 1 : 0);
			bitStream.writeBit(bitToWrite);
		}

	}
}
