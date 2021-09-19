
class Update_Actions
{
	constructor(entityId, actionCodes)
	{
		this.entityId = entityId;
		this.actionCodes = actionCodes;
	}

	updateWorld(world)
	{
		var entity = world.entityById(this.entityId);

		if (entity != null)
		{
			entity.ticksSinceActionPerformed = 0;
			var entityActivity = entity.activity;
			var entityActivityActionCodes = entityActivity.actionCodes;
			entityActivityActionCodes.length = 0;
			entityActivityActionCodes.push(...this.actionCodes);
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

		var entityIdBitWidth = 4; // max 16
		var entityId = bitStream.readBitsAsNumberUnsigned(entityIdBitWidth);

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
			entityId, actionCodes
		);

		return returnValue;
	}

	writeToBitStream(bitStream)
	{
		var updateCode = 0;
		var updateCodeBitWidth = 3;
		bitStream.writeNumberUsingBitWidth(updateCode, updateCodeBitWidth);

		var entityIdBitWidth = 4; // max 16
		bitStream.writeNumberUsingBitWidth(this.entityId, entityIdBitWidth);

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
