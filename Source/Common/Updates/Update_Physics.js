
class Update_Physics
{
	constructor(bodyIndex, loc)
	{
		this.bodyIndex = bodyIndex;
		this.loc = loc;
	}

	// instance methods

	updateWorld(world)
	{
		var body = world.bodyByIndex(this.bodyIndex);
		if (body != null)
		{
			body.loc.overwriteWith(this.loc);
		}
	}

	// serialization

	static deserialize(updateSerialized)
	{
		var bytes = ByteHelper.binaryStringToBytes(updateSerialized);
		var bitStream = new BitStream(bytes);
		var returnValue = Update_Physics.readFromBitStream(bitStream);
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

		var bitsForBodyIndex = 3; // max 8
		var bodyIndex = bitStream.readBitsAsNumberUnsigned(3);

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

		var returnValue = new Update_Physics(bodyIndex, loc);

		return returnValue;
	}

	writeToBitStream(bitStream)
	{
		var updateCode = 5;
		bitStream.writeNumberUsingBitWidth(updateCode, 3);

		var bitsForBodyIndex = 3; // max 8
		bitStream.writeNumberUsingBitWidth
		(
			this.bodyIndex, bitsForBodyIndex
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
		var forwardInTurns = this.loc.forwardInTurns;

		forwardInTurns *= Math.round(angleMultiplier);

		bitStream.writeNumberUsingBitWidth
		(
			forwardInTurns, bitsForAngleResolution
		);
	}
}
