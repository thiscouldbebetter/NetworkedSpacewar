
class User
{
	constructor(name, passwordSalt, passwordSaltedAndHashedAsBase64)
	{
		this.name = name;
		this.passwordSalt = passwordSalt;
		this.passwordSaltedAndHashedAsBase64 =
			passwordSaltedAndHashedAsBase64;
	}

	isPasswordValid(hasher, passwordToCheck)
	{
		var passwordToCheckSaltedAndHashedAsBase64 =
			this.passwordSaltHashAndBase64
			(
				hasher, passwordToCheck, this.passwordSalt
			);

		var returnValue =
		(
			passwordToCheckSaltedAndHashedAsBase64
				== this.passwordSaltedAndHashedAsBase64
		);
		return returnValue;
	}

	passwordSaltHashAndBase64(hasher, passwordInPlaintext, salt)
	{
		var passwordSalted = passwordInPlaintext + salt;
		var passwordSaltedAndHashed = hasher.hashString(passwordSalted);
		var passwordSaltedAndHashedAsBase64 =
			Base64Converter.toBase64(passwordSaltedAndHashed);
		return passwordSaltedAndHashedAsBase64;
	}

	passwordSet(passwordInPlaintext)
	{
		this.passwordSalt = Math.random().toString(16).substring(2);
		this.passwordSaltedAndHashedAsBase64 =
			passwordSaltHashAndBase64(passwordInPlaintext, this.passwordSalt);
		return this;
	}

	// String conversions for UsersKnown file.

	static fromString_UserKnown(userAsString)
	{
		var delimiter = ";";

		var parts = userAsString.split(delimiter);
		var userName = parts[0];
		var userPasswordSalt = parts[1];
		var userPasswordSaltedAndHashedAsBase64 = parts[2];
		var returnValue = new User
		(
			userName,
			userPasswordSalt,
			userPasswordSaltedAndHashedAsBase64
		);
		return returnValue;
	}

	static manyFromFilesystemProviderAndPath(filesystemProvider, filePath)
	{
		var usersKnownAsString =
			filesystemProvider.fileReadFromPath(filePath);
		var users = User.manyFromUsersKnownAsString(usersKnownAsString);
		return users;
	}

	static manyFromUsersKnownAsString(usersKnownAsString)
	{
		var newline = "\n";

		var usersKnownAsLines = usersKnownAsString.split(newline);

		usersKnownAsLines = usersKnownAsLines.filter
		(
			x =>
				x.startsWith("//") == false
				&& x.trim() != ""
		);

		var users = usersKnownAsLines.map
		(
			userAsString => User.fromString_UserKnown(userAsString)
		);
		return users;
	}

	toString_UserKnown()
	{
		var delimiter = ";";

		var returnValue = 
		[
			this.name,
			this.passwordSalt,
			this.passwordSaltedAndHashedAsBase64
		].join(delimiter);

		return returnValue;
	}
}
