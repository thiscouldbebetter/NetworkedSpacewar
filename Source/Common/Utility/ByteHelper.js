
class ByteHelper
{
	static binaryStringToBytes(binaryString)
	{
		var bytes = [];

		for (var i = 0; i < binaryString.length; i++)
		{
			var byte = binaryString.charCodeAt(i);
			bytes.push(byte);
		}

		return bytes;
	}

	static bytesToBinaryString(bytes)
	{
		var binaryString = "";

		bytes.forEach(x => binaryString += String.fromCharCode(x));

		return binaryString;
	}
}
