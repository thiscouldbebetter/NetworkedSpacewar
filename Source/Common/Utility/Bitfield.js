
class Bitfield
{
	constructor(fieldNameBitWidthPairs)
	{
		this.fieldNameBitWidthPairs = fieldNameBitWidthPairs;
	}

	bytesToFieldValuesByName(bytes)
	{
		var bitStream = new BitStream(bytes);

		var fieldValuesByName = new Map();
		for (var i = 0; i < this.fieldNameBitWidthPairs.length; i++)
		{
			var fieldNameAndBitWidth = this.fieldNameBitWidthPairs[i];
			var fieldName = fieldNameAndBitWidth[0];
			var fieldWidthInBits = fieldNameAndBitWidth[1];

			var fieldValue =
				bitStream.readBitsAsNumberUnsigned(fieldWidthInBits);

			fieldValuesByName.set(fieldName, fieldValue);
		}

		return fieldValuesByName;
	}

	fieldValuesByNameToBytes(fieldValuesByName)
	{
		var bitStream = new BitStream([]);
		for (var i = 0; i < this.fieldNameBitWidthPairs.length; i++)
		{
			var fieldNameAndBitWidth = this.fieldNameBitWidthPairs[i];
			var fieldName = fieldNameAndBitWidth[0];
			var fieldWidthInBits = fieldNameAndBitWidth[1];

			var fieldValue = fieldValuesByName.get(fieldName);

			bitStream.writeNumberUsingBitWidth(fieldValue, fieldWidthInBits);
		}

		var bytes = bitStream.bytes;

		return bytes;
	}
}
