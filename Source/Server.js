// Bootstrap classes.

class CodeCompiler
{
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

class FilesystemProviderFS
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

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

var fs = require("fs");
var filesystemProvider = new FilesystemProviderFS(fs);

var commonDirectoryPath = "./Common/";

var compiler = new CodeCompiler();
var classesByName = compiler.readAndCompileClassFilesInDirectory
(
	filesystemProvider, commonDirectoryPath, new Map()
);

var Action = classesByName.get("Action");
var Activity = classesByName.get("Activity");
var ArrayHelper = classesByName.get("ArrayHelper");
var Base64Converter = classesByName.get("Base64Converter");
var Body = classesByName.get("Body");
var BodyDefn = classesByName.get("BodyDefn");
var ClientConnection = classesByName.get("ClientConnection");
var ColorHelper = classesByName.get("ColorHelper");
var Coords = classesByName.get("Coords");
var Device = classesByName.get("Device");
var HasherCrypto = classesByName.get("HasherCrypto");
var IDHelper = classesByName.get("IDHelper");
var Location = classesByName.get("Location");
var Log = classesByName.get("Log");
var NumberHelper = classesByName.get("NumberHelper");
var Orientation = classesByName.get("Orientation");
var Polar = classesByName.get("Polar")
var RandomizerSystem = classesByName.get("RandomizerSystem");
var Serializer = classesByName.get("Serializer");
var SerializerNode = classesByName.get("SerializerNode");
var Session = classesByName.get("Session");
var ShapeCircle = classesByName.get("ShapeCircle");
var ShapeRay = classesByName.get("ShapeRay");
var VisualGroup = classesByName.get("VisualGroup");
var VisualShape = classesByName.get("VisualShape");
var VisualText = classesByName.get("VisualText");
var Update_Actions = classesByName.get("Update_Actions");
var Update_BodyCreate = classesByName.get("Update_BodyCreate");
var Update_BodyRemove = classesByName.get("Update_BodyRemove");
var Update_BodyDefnRegister = classesByName.get("Update_BodyDefnRegister");
var Update_Physics = classesByName.get("Update_Physics");
var User = classesByName.get("User");
var World = classesByName.get("World");

var crypto = require("crypto");
var hasher = new HasherCrypto(crypto);

class Server
{
	constructor
	(
		portToListenOn,
		areAnonymousUsersAllowed,
		usersKnown,
		world
	)
	{
		this.portToListenOn = portToListenOn;
		this.areAnonymousUsersAllowed = areAnonymousUsersAllowed;
		this.usersKnown = usersKnown;
		this.world = world;

		this.usersKnownByName =
			ArrayHelper.addLookupsByName(this.usersKnown);
	}

	initialize()
	{
		this.clientConnections = [];
		
		Log.IsEnabled = true;

		this.serializer = new Serializer;

		this.clientID = IDHelper.Instance().idNext();

		this.updatesIncoming = [];

		var socketIO = require("socket.io");
		var io = socketIO.listen
		(
			this.portToListenOn,
			{ log: false }
		);

		io.sockets.on
		(
			"connection", 
			this.handleEvent_ClientConnecting.bind(this)
		);

		console.log("Server started at " + new Date().toLocaleTimeString());
		console.log
		(
			"Anoymous users are "
			+ (this.areAnonymousUsersAllowed ? "" : "NOT ")
			+ "allowed."
		)
		console.log("World:" + JSON.stringify(this.world));
		console.log("Listening on port " + this.portToListenOn + "...");

		setInterval
		(
			this.updateForTick.bind(this),
			this.world.millisecondsPerTick()
		);
	}

	updateForTick()
	{
		var world = this.world;

		world.updateForTick_UpdatesApply(this.updatesIncoming);

		world.updateForTick_Spawn();

		this.updateForTick_Server();

		world.updateForTick_UpdatesApply(world.updatesImmediate);

		world.updateForTick_Remove();

		this.updateForTick_UpdatesOutgoingSend();
	}

	updateForTick_Server()
	{
		var world = this.world;
		var bodies = world.bodies;

		for (var i = 0; i < bodies.length; i++)
		{
			var body = bodies[i];
			body.updateForTick_Integrity(world);
			body.updateForTick_Actions(world);
			body.updateForTick_Physics(world);
		}

		for (var i = 0; i < bodies.length; i++)
		{
			var body = bodies[i];
			body.updateForTick_Collisions(world, i);
		}
	}

	updateForTick_UpdatesOutgoingSend()
	{
		var world = this.world;

		var updates = world.updatesOutgoing;
		for (var i = 0; i < updates.length; i++)
		{
			var update = updates[i];
			var serializer = (update.serialize == null ? this.serializer : update);
			var updateSerialized = serializer.serialize(update);

			for (var c = 0; c < this.clientConnections.length; c++)
			{
				var clientConnection = this.clientConnections[c];
				var socketToClient = clientConnection.socket;
				socketToClient.emit("update", updateSerialized);
			}
		}
		updates.length = 0;
	}

	// events

	handleEvent_ClientConnecting(socketToClient)
	{
		var clientIndex = this.clientConnections.length;
		var clientID = "C_" + clientIndex;

		var clientConnection =
			new ClientConnection(this, clientID, socketToClient);
		this.clientConnections.push(clientConnection);
		this.clientConnections[clientID] = clientConnection;

		socketToClient.emit("connected", clientID);
	}
}

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

	var playersMax = parseInt(argsByName.get("--players-max"));
	var arenaSize = parseInt(argsByName.get("--arena-size"));
	var planetSize = parseInt(argsByName.get("--planet-size"));
	var shipSize = parseInt(argsByName.get("--ship-size"));
	var bulletSize = parseInt(argsByName.get("--bullet-size"));

	var world = World.build
	(
		playersMax, arenaSize, planetSize, shipSize, bulletSize
	);

	var server = new Server
	(
		servicePort, areAnonymousUsersAllowed, usersKnown, world
	);

	server.initialize();
}

main();
