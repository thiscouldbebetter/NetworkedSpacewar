
class BitStream
{
	constructor(bytes)
	{
		this.bytes = bytes || [];

		this.byteOffset = 0;
		this.bitOffsetWithinByte = 0;
	}

	static BitsPerByte = 8;

	backUpBits(bitCount)
	{
		for (var i = 0; i < bitCount; i++)
		{
			this.bitOffsetDecrement();
		}
	}

	bitOffsetDecrement()
	{
		this.bitOffsetWithinByte--;
		if (this.bitOffsetWithinByte < 0)
		{
			this.byteOffset--;
			this.bitOffsetWithinByte = BitStream.BitsPerByte - 1;
		}
	}

	bitOffsetIncrement()
	{
		this.bitOffsetWithinByte++;
		if (this.bitOffsetWithinByte >= BitStream.BitsPerByte)
		{
			this.byteOffset++;
			this.bitOffsetWithinByte = 0;
		}
	}

	byteCurrent()
	{
		return this.bytes[this.byteOffset];
	}

	peekAtBitsAsNumberUnsigned(bitCount)
	{
		var returnValue = this.readBitsAsNumberUnsigned(bitCount);
		this.backUpBits(bitCount);
		return returnValue;
	}

	readBit()
	{
		var byteCurrent = this.byteCurrent();
		var bitOffsetWithinByteReversed =
			BitStream.BitsPerByte - this.bitOffsetWithinByte - 1;

		var bit = (byteCurrent >> bitOffsetWithinByteReversed) & 1;

		this.bitOffsetIncrement();

		return bit;
	}

	readBitsAsNumberUnsigned(bitCount)
	{
		var returnValue = 0;

		for (var i = 0; i < bitCount; i++)
		{
			var bit = this.readBit();
			var shiftAmount = bitCount - i - 1;
			var bitShifted = bit << shiftAmount;
			returnValue |= bitShifted;
		}

		return returnValue;
	}

	writeBit(bitToWrite)
	{
		if (this.byteOffset >= this.bytes.length)
		{
			this.bytes.push(0);
		}

		var byte = this.byteCurrent();

		var bitOffsetWithinByteReversed =
			BitStream.BitsPerByte - this.bitOffsetWithinByte - 1;

		var bitToWriteShifted =
			bitToWrite << bitOffsetWithinByteReversed;

		this.bytes[this.byteOffset] |= bitToWriteShifted;

		this.bitOffsetIncrement();
	}

	writeByte(byteToWrite)
	{
		this.writeNumberUsingBitWidth(byteToWrite, BitStream.BitsPerByte);
	}

	writeBytes(bytesToWrite)
	{
		for (var i = 0; i < bytesToWrite.length; i++)
		{
			var byte = bytesToWrite[i];
			this.writeByte(byte);
		}
	}

	writeNumberUsingBitWidth(numberToWrite, bitWidth)
	{
		for (var i = 0; i < bitWidth; i++)
		{
			var iReversed = bitWidth - i - 1;
			var bitToWrite = (numberToWrite >> iReversed) & 1; 
			this.writeBit(bitToWrite);
		}
	}
}
