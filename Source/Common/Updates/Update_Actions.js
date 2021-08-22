
class Update_Actions
{
	constructor(bodyId, actionCodes)
	{
		this.bodyId = bodyId;
		this.actionCodes = actionCodes;
	}

	updateWorld(world)
	{
		var body = world.bodyById(this.bodyId);

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

	deserialize(updateAsBytes)
	{
		var bitStream = new BitStream(updateAsBytes);
		var returnValue = new Update_Actions().readFromBitStream(bitStream);
		return returnValue;
	}

	serialize(serializer)
	{
		var bitStream = new BitStream();
		this.writeToBitStream(bitStream);
		var returnValue = bitStream.bytes;
		return returnValue;
	}

	// bitStream

	readFromBitStream(bitStream)
	{
		var updateCodeBitWidth = 3; // max 8
		var updateCode = bitStream.readBitsAsNumberUnsigned(updateCodeBitWidth);

		var bodyIdBitWidth = 4; // max 16
		var bodyId = bitStream.readBitsAsNumberUnsigned(bodyIdBitWidth);

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
			bodyId, actionCodes
		);

		return returnValue;
	}

	writeToBitStream(bitStream)
	{
		var updateCode = 0;
		var updateCodeBitWidth = 3;
		bitStream.writeNumberUsingBitWidth(updateCode, updateCodeBitWidth);

		var bodyIdBitWidth = 4; // max 16
		bitStream.writeNumberUsingBitWidth(this.bodyId, bodyIdBitWidth);

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
