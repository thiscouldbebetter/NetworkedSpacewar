
class Update //
{
	static Instances()
	{
		if (Update._instances == null)
		{
			Update._instances = new Update_Instances();
		}

		return Update._instances;
	}

	// Serialization.

	static deserialize(updateSerialized, serializer)
	{
		var returnValue = null;

		var isJson = (updateSerialized.constructor.name != Array.name); // hack

		if (isJson)
		{
			returnValue = serializer.deserialize(updateSerialized);
		}
		else
		{
			var bitStream = new BitStream(updateSerialized);
			returnValue = Update.readFromBitStream(bitStream);
		}

		return returnValue;
	}

	static readFromBitStream(bitStream)
	{
		var updateCodeSizeInBits = 3;
		var updateCode =
			bitStream.peekAtBitsAsNumberUnsigned(updateCodeSizeInBits);

		var update = Update.Instances().byCode(updateCode);
		update = update.readFromBitStream(bitStream);
		return update;
	}

	static writeToBitStream(update, bitStream)
	{
		var updateCode = Update.Instances().codeForUpdate(update);
		return updateCode;
	}
}
