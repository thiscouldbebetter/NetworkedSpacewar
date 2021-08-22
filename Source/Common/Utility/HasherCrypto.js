class HasherCrypto
{
	constructor(crypto)
	{
		this.crypto = crypto;
	}

	hashString(stringToHash)
	{
		var stringHashed =
			this.crypto.createHash
			(
				"sha256"
			).update
			(
				stringToHash
			).digest
			(
				"hex"
			);

		return stringHashed;
	}
}
