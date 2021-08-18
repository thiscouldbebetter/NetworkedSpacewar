
export class CodeCompiler
{
	// The classes created with eval() here
	// don't work if this class is imported,
	// rather than declared in the calling scope.

	readAndCompileClassFilesInDirectory
	(
		filesystemProvider, directoryPath, classesByName
	)
	{
		var fileAndSubdirectoryNamesInDirectory =
			filesystemProvider.fileAndSubdirectoryNamesInDirectoryAtPath
			(
				directoryPath
			);

		var fileExtensionJs = ".js";

		var subdirectoryNamesInDirectory =
			fileAndSubdirectoryNamesInDirectory.filter
			(
				x => (x.indexOf(".") == -1)
				&& (x.startsWith("_") == false) 
			);

		for (var i = 0; i < subdirectoryNamesInDirectory.length; i++)
		{
			var subdirectoryName = subdirectoryNamesInDirectory[i];
			var subdirectoryPath = directoryPath + subdirectoryName + "/";
			this.readAndCompileClassFilesInDirectory
			(
				filesystemProvider, subdirectoryPath, classesByName
			);
		}

		var codeFileNamesInDirectory =
			fileAndSubdirectoryNamesInDirectory.filter
			(
				x => x.endsWith(fileExtensionJs)
			);

		var codeFilePaths = codeFileNamesInDirectory.map
		(
			x => directoryPath + x
		);

		for (var i = 0; i < codeFilePaths.length; i++)
		{
			var codeFilePath = codeFilePaths[i];
			var filePathAsParts = codeFilePath.split("/");
			var fileName = filePathAsParts[filePathAsParts.length - 1];
			var className = fileName.split(".")[0];
			var codeBlockToCompile =
				filesystemProvider.fileReadFromPath(codeFilePath);
			var codeBlockToCompileWrapped =
				"(" + codeBlockToCompile + ")";
			var classCompiled = eval(codeBlockToCompileWrapped);
			classesByName.set(className, classCompiled);
		}

		return classesByName;
	}
}
