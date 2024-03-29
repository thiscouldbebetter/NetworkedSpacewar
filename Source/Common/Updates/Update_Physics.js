
class Update_Physics
{
	constructor(entityId, loc)
	{
		this.entityId = entityId;
		this.loc = loc;
	}

	// instance methods

	updateWorld(world)
	{
		var entity = world.entityById(this.entityId);
		if (entity != null)
		{
			entity.loc.overwriteWith(this.loc);
		}
	}

	// serialization

	static deserialize(updateAsBytes)
	{
		var bitStream = new BitStream(updateAsBytes);
		var returnValue = Update_Physics.readFromBitStream(bitStream);
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
		var updateCode = bitStream.readBitsAsNumberUnsigned(3);

		var bitsForEntityId = 4; // max 16
		var entityId = bitStream.readBitsAsNumberUnsigned(bitsForEntityId);

		var posX = bitStream.readBitsAsNumberUnsigned(10); // max 1024
		var posY = bitStream.readBitsAsNumberUnsigned(10); // max 1024

		var bitsForLinearResolution = 2; // max 4
		var pixelDivisor = Math.pow(2, bitsForLinearResolution);

		posX /= pixelDivisor;
		posY /= pixelDivisor;

		var pos = new Coords(posX, posY);

		var bitsForAngleResolution = 5; // max 32
		var angleDivisor = Math.pow(2, bitsForAngleResolution);

		var forwardInTurns =
			bitStream.readBitsAsNumberUnsigned(bitsForAngleResolution);
		forwardInTurns = forwardInTurns / angleDivisor;

		var loc = new Location(pos, forwardInTurns);

		var returnValue = new Update_Physics(entityId, loc);

		return returnValue;
	}

	writeToBitStream(bitStream)
	{
		var updateCode = 5;
		bitStream.writeNumberUsingBitWidth(updateCode, 3);

		var bitsForEntityId = 4; // max 16
		bitStream.writeNumberUsingBitWidth
		(
			this.entityId, bitsForEntityId
		);

		var pos = this.loc.pos;

		var bitsForLinearResolution = 2; // max 4
		var pixelMultiplier = Math.pow(2, bitsForLinearResolution);

		var posX = Math.round(pos.x * pixelMultiplier);
		var posY = Math.round(pos.y * pixelMultiplier);

		bitStream.writeNumberUsingBitWidth(posX, 10);
		bitStream.writeNumberUsingBitWidth(posY, 10);

		var bitsForAngleResolution = 5; // max 32
		var angleMultiplier = Math.pow(2, bitsForAngleResolution);
		var forwardInTurns = this.loc.orientation.forward.headingInTurns();

		forwardInTurns *= Math.round(angleMultiplier);

		bitStream.writeNumberUsingBitWidth
		(
			forwardInTurns, bitsForAngleResolution
		);
	}
}
