
class Update_Actions
{
	constructor(bodyId, actionCodes)
	{
		this.bodyId = bodyId;
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
		return this.deserializeFromBinaryString(updateSerialized);
	}

	serialize()
	{
		return this.serializeToBinaryString();
	}

	// Serialization - Binary string.

	bitfieldActionCodes()
	{
		return new Bitfield
		([
			["actionCode0", 3],
			["actionCode1", 3],
			["actionCode2", 3],
			["actionCode3", 3],
			["actionCode4", 3],
		]);
	}

	deserializeFromBinaryString(updateAsBinaryString)
	{
		var updateAsBytes =
			ByteHelper.binaryStringToBytes(updateAsBinaryString);

		var bitfield = this.bitfieldActionCodes();
		var fieldValuesByName =
			bitfield.bytesToFieldValuesByName(updateAsBytes);

		var actionCodes = bitfield.fieldNameBitWidthPairs.map
		(
			x => fieldValuesByName.get(x[0])
		);

		var returnValue = new Update_Actions
		(
			null, // bodyId - Will be set in calling scope.
			actionCodes
		);

		return returnValue;
	}

	serializeToBinaryString()
	{
		var bitfield = this.bitfieldActionCodes();
		var fieldValuesByName = new Map
		(
			this.actionCodes.map
			(
				(x, i) => ["actionCode" + i, x]
			)
		);

		var updateAsBytes =
			bitfield.fieldValuesByNameToBytes(fieldValuesByName);

		var updateAsBinaryString =
			ByteHelper.bytesToBinaryString(updateAsBytes);

		return updateAsBinaryString;
	}

	// Serialization - Human-readable (sort of).

	static updateCode()
	{
		return "A";
	}

	serializeToHumanReadableString()
	{
		var returnValue =
			Update_Actions.updateCode() + ";"
			+ this.bodyId + ";"
			+ this.actionCodes.join(";");

		return returnValue;
	}

	deserializeFromHumanReadableString(updateSerialized)
	{
		var parts = updateSerialized.split(";");

		var returnValue = new Update_Actions
		(
			parts[1], // bodyId
			parts.slice(2) // actionNames
		);

		return returnValue
	}

}
