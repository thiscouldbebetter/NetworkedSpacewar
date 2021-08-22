
class ByteStream
{
	constructor(bytes)
	{
		this.bytes = bytes;

		this.byteOffset = 0;
	}

	byteCurrent()
	{
		return this.bytes[this.byteOffset];
	}

	hasMoreBytes()
	{
		return (this.byteOffset < this.bytes.length);
	}

	readByte()
	{
		var byteCurrent = this.byteCurrent();
		this.byteOffset++;

		return byteCurrent
	}

	readBytes(byteCount)
	{
		var bytesRead = [];

		for (var i = 0; i < byteCount; i++)
		{
			bytesRead.push(this.readByte());
		}

		return bytesRead;
	}

	writeByte(byteToWrite)
	{
		this.bytes[this.byteOffset] = bitToWrite;

		this.byteOffset++;
	}
}
