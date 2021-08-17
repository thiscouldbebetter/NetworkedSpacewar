
class Base64Converter
{
	static fromBase64(base64ToConvert)
	{
		return Buffer.from(base64ToConvert, "base64").toString();
	}

	static toBase64(stringToConvert)
	{
		return Buffer.from(stringToConvert).toString("base64");
	}
}
