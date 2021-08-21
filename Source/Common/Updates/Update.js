
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
