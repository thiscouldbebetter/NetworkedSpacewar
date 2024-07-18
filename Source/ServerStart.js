import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Read the class definitions from the filesystem.
// It's very tempting to replace all this mess
// with a bunch of import calls,
// but adding the exports to the class definitions
// makes them unreadable from Local.html.

class CodeCompiler
{
	// The classes created with eval() here
	// don't work if this is imported,
	// rather than actually declared in the calling scope.

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

import { FilesystemProviderFs } from "./Common/_Bootstrap/FilesystemProviderFs.js";
var fs = require("fs");
var filesystemProvider = new FilesystemProviderFs(fs);

var compiler = new CodeCompiler(filesystemProvider);

var commonDirectoryPath = "./Common/";

var classesByName = compiler.readAndCompileClassFilesInDirectory
(
	filesystemProvider,
	commonDirectoryPath,
	new Map()
);

var Action = classesByName.get("Action");
var Activity = classesByName.get("Activity");
var BitStream = classesByName.get("BitStream");
var ByteHelper = classesByName.get("ByteHelper");
var ClientConnection = classesByName.get("ClientConnection");
var Device = classesByName.get("Device");
var Entity = classesByName.get("Entity");
var EntityDefn = classesByName.get("EntityDefn");
var Server = classesByName.get("Server");
var Session = classesByName.get("Session");
var SocketProviderSocketIo = classesByName.get("SocketProviderSocketIo");
var Universe = classesByName.get("Universe");
var User = classesByName.get("User");
var World = classesByName.get("World");

var ColorHelper = classesByName.get("ColorHelper");

var VisualGroup = classesByName.get("VisualGroup");
var VisualShape = classesByName.get("VisualShape");
var VisualText = classesByName.get("VisualText");

var Coords = classesByName.get("Coords");
var Location = classesByName.get("Location");
var Orientation = classesByName.get("Orientation");
var Polar = classesByName.get("Polar");

var ShapeCircle = classesByName.get("ShapeCircle");
var ShapeGroup = classesByName.get("ShapeGroup");
var ShapePolygon = classesByName.get("ShapePolygon");
var ShapeRay = classesByName.get("ShapeRay");

var ArrayHelper = classesByName.get("ArrayHelper");
var MapHelper = classesByName.get("MapHelper");
var NumberHelper = classesByName.get("NumberHelper");

var Serializer = classesByName.get("Serializer");
var SerializerNode = classesByName.get("SerializerNode");

var Update = classesByName.get("Update");
var Update_Actions = classesByName.get("Update_Actions");
var Update_EntityCreate = classesByName.get("Update_EntityCreate");
var Update_EntityRemove = classesByName.get("Update_EntityRemove");
var Update_EntityDefnRegister = classesByName.get("Update_EntityDefnRegister");
var Update_Group = classesByName.get("Update_Group");
var Update_Instances = classesByName.get("Update_Instances");
var Update_Physics = classesByName.get("Update_Physics");

var Base64Converter = classesByName.get("Base64Converter");
var HasherCrypto = classesByName.get("HasherCrypto");
var IDHelper = classesByName.get("IDHelper");
var Log = classesByName.get("Log");
var RandomizerSystem = classesByName.get("RandomizerSystem");

// Games.

// Chess.

// var WorldBuilderChess = classesByName.get("WorldBuilderChess");

// Spacewar.

var EntityDefnSpacewar = classesByName.get("EntityDefnSpacewar");
var EntityDefnSpacewarBuilder = classesByName.get("EntityDefnSpacewarBuilder");
var WorldBuilderSpacewar = classesByName.get("WorldBuilderSpacewar");
var WorldDefnSpacewar = classesByName.get("WorldDefnSpacewar");

function main()
{
	var args = process.argv;
	var argsByName = new Map();

	for (var a = 2; a < args.length; a++)
	{
		var arg = args[a];

		var argParts = arg.split("=");

		var argName = argParts[0];
		var argValue = argParts[1];

		argsByName.set(argName, argValue);
	}

	var argDefaultsByName = new Map
	([
		// todo - Move game-specific settings elsewhere.

		[ "--game", "spacewar" ],
		[ "--anonymous-users-allowed", "false" ],
		[ "--arena-size", "128" ],
		[ "--bullet-size", "1" ],
		[ "--planet-size", "10" ],
		[ "--port", "8089" ],
		[ "--ship-size", "3" ],
		[ "--players-max", "2" ]
	]);

	argDefaultsByName.forEach
	(
		(argValueDefault, argName) =>
		{
			if (argsByName.has(argName) == false)
			{
				argsByName.set(argName, argValueDefault);
			}
		}
	);

	console.log("args:");
	argsByName.forEach
	(
		(argValue, argName) =>
		{
			console.log(argName + ": " + argValue);
		}
	);

	var servicePort = parseInt(argsByName.get("--port"));

	var areAnonymousUsersAllowed =
		(argsByName.get("--anonymous-users-allowed") == "true");

	var usersKnown = User.manyFromFilesystemProviderAndPath
	(
		filesystemProvider, "UsersKnown.txt"
	);

	var world = null;

	var gameName = argsByName.get("--game").toLowerCase();

	if (gameName == "spacewar")
	{
		var playersMax = parseInt(argsByName.get("--players-max"));
		var arenaSize = parseInt(argsByName.get("--arena-size"));
		var planetSize = parseInt(argsByName.get("--planet-size"));
		var shipSize = parseInt(argsByName.get("--ship-size"));
		var bulletSize = parseInt(argsByName.get("--bullet-size"));

		var worldBuilder = new WorldBuilderSpacewar();

		world = worldBuilder.build
		(
			playersMax, arenaSize, planetSize, shipSize, bulletSize
		);
	}
	else if (gameName == "chess")
	{
		var worldBuilder = new WorldBuilderChess();

		world = worldBuilder.build();
	}
	else
	{
		throw new Error("Unrecognized game name: " + gameName);
	}

	var universe = new Universe(world);

	var crypto = require("crypto");
	var hasher = new HasherCrypto(crypto);

	var socketIo = require("socket.io");
	var socketProvider = new SocketProviderSocketIo(socketIo);

	var server = new Server
	(
		servicePort,
		areAnonymousUsersAllowed,
		hasher,
		socketProvider,
		usersKnown,
		universe
	);

	server.initialize();
}

main();
