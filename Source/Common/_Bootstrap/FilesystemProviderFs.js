
export class FilesystemProviderFs
{
	constructor(fs)
	{
		this.fs = fs;
	}

	fileAndSubdirectoryNamesInDirectoryAtPath(directoryPath)
	{
		return this.fs.readdirSync(directoryPath);
	}

	fileReadFromPath(filePath)
	{
		return this.fs.readFileSync(filePath).toString();
	}

	writeStringToFileAtPath(stringToWrite, filePath)
	{
		this.fs.writeFileSync(filePath, stringToWrite);
	}
}
