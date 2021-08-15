import { createRequire } from 'module';
const require = createRequire(import.meta.url);

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
var fs = require("fs");
var filesystemProvider = new FilesystemProviderFS(fs);

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
var crypto = require("crypto");
var hasher = new HasherCrypto(crypto);

var commonDirectoryPath = "./Common/";

var classesByName = readAndCompileClassFilesInDirectory
(
	filesystemProvider, commonDirectoryPath, new Map()
);

var Action = classesByName.get("Action");
var Activity = classesByName.get("Activity");
var ArrayHelper = classesByName.get("ArrayHelper");
var Body = classesByName.get("Body");
var BodyDefn = classesByName.get("BodyDefn");
var ColorHelper = classesByName.get("ColorHelper");
var Coords = classesByName.get("Coords");
var Device = classesByName.get("Device");
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
var World = classesByName.get("World");

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

class ClientConnection
{
	constructor(server, clientID, socket)
	{
		this.server = server;
		this.clientID = clientID;
		this.socket = socket;

		this.socket.on
		(
			"identify", 
			this.handleEvent_ClientIdentifyingSelf.bind(this)
		);
	}

	handleEvent_ClientDisconnected(e)
	{
		var bodiesByName = this.server.world.bodiesByName;
		var bodyToDestroy = bodiesByName.get(this.clientID);
		if (bodyToDestroy == null)
		{
			console.log(this.clientID + " left the server.");
		}
		else
		{
			bodyToDestroy.integrity = 0;
			console.log(bodyToDestroy.name + " left the server.");
		}
	}

	handleEvent_ClientIdentifyingSelf(clientNameColonPassword)
	{
		var server = this.server;

		var clientNameAndPassword = clientNameColonPassword.split(":");
		var clientName = clientNameAndPassword[0];
		var clientPassword = clientNameAndPassword[1];

		var usersKnownByName = server.usersKnownByName;
		var areUserAndPasswordValid =
		(
			usersKnownByName.has(clientName)
			&& usersKnownByName.get(clientName).isPasswordValid(clientPassword)
		);

		var clientConnection = server.clientConnections[this.clientID];
		var socketToClient = clientConnection.socket;

		if
		(
			server.areAnonymousUsersAllowed == false
			&& areUserAndPasswordValid == false
		)
		{
			var errorMessage =
				"Invalid username or password for name: " + clientName;
			console.log(errorMessage);
			socketToClient.emit("serverError", errorMessage);
			return;
		}

		this.clientName = clientName;

		var session = new Session(this.clientID, server.world);
		var sessionSerialized = server.serializer.serialize(session);
		socketToClient.emit("sessionEstablished", sessionSerialized);

		var world = server.world;
		var bodyDefnPlayer = world.bodyDefnsByName.get("_Player");
		var bodyDefnForClient = bodyDefnPlayer.clone();
		bodyDefnForClient.name = this.clientID;
		bodyDefnForClient.color = ColorHelper.random();

		var updateBodyDefnRegister = new Update_BodyDefnRegister
		(
			bodyDefnForClient
		);
		updateBodyDefnRegister.updateWorld(world);
		world.updatesOutgoing.push(updateBodyDefnRegister);

		var posRandom = new Coords().randomize().multiply(world.size);
		var forwardInTurnsRandom = Math.random();
		var locRandom = new Location
		(
			posRandom, forwardInTurnsRandom
		);

		var bodyForClient = new Body
		(
			this.clientID, // id
			clientName, // name
			bodyDefnForClient.name,
			locRandom
		);

		var updateBodyCreate = new Update_BodyCreate(bodyForClient);
		world.updatesOutgoing.push(updateBodyCreate);
		updateBodyCreate.updateWorld(world);

		socketToClient.on
		(
			"update",
			this.handleEvent_ClientUpdateReceived.bind(this)
		);

		socketToClient.on
		(
			"disconnect",
			this.handleEvent_ClientDisconnected.bind(this)
		);

		console.log(clientName + " joined the server.");
	}

	handleEvent_ClientUpdateReceived(updateSerialized)
	{
		var serializer;
		var firstChar = updateSerialized[0];
		if (firstChar == "{") // JSON
		{
			serializer = this.server.serializer;
		}
		else // terse
		{
			var updateCode = firstChar;
			if (updateCode == Update_Actions.updateCode())
			{
				serializer = new Update_Actions();
			}
		}

		var update = serializer.deserialize
		(
			updateSerialized
		);

		update.updateWorld(this.server.world);
	}
}

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

		for (var i = 0; i < world.updatesOutgoing.length; i++)
		{
			var update = world.updatesOutgoing[i];
			var serializer = (update.serialize == null ? this.serializer : update);
			var updateSerialized = serializer.serialize(update);

			for (var c = 0; c < this.clientConnections.length; c++)
			{
				var clientConnection = this.clientConnections[c];
				var socketToClient = clientConnection.socket;
				socketToClient.emit("update", updateSerialized);
			}
		}
		world.updatesOutgoing.length = 0;
	}

	// events

	handleEvent_ClientConnecting(socketToClient)
	{
		var clientIndex = this.clientConnections.length;
		var clientID = "C_" + clientIndex;

		var clientConnection = new ClientConnection(this, clientID, socketToClient);
		this.clientConnections.push(clientConnection);
		this.clientConnections[clientID] = clientConnection;

		socketToClient.emit("connected", clientID);
	}
}

class User
{
	constructor(name, passwordSalt, passwordSaltedAndHashedAsBase64)
	{
		this.name = name;
		this.passwordSalt = passwordSalt;
		this.passwordSaltedAndHashedAsBase64 =
			passwordSaltedAndHashedAsBase64;
	}

	isPasswordValid(passwordToCheck)
	{
		var passwordToCheckSaltedAndHashedAsBase64 =
			this.passwordSaltHashAndBase64(passwordToCheck, this.passwordSalt);
		var returnValue =
		(
			passwordToCheckSaltedAndHashedAsBase64
				== this.passwordSaltedAndHashedAsBase64
		);
		return returnValue;
	}

	passwordSaltHashAndBase64(passwordInPlaintext, salt)
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

function main()
{
	var args = process.argv;

	for (var a = 2; a < args.length; a++)
	{
		var arg = args[a];

		var argParts = arg.split("=");

		var argName = argParts[0];
		var argValue = argParts[1];

		args[argName] = argValue;
	}

	var argNameToDefaultLookup = 
	{
		"--anonymous-users-allowed" : "false",
		"--arena-size" : "128",
		"--bullet-size" : "1",
		"--planet-size" : "10",
		"--port" : "8089",
		"--ship-size" : "3",
		"--players-max" : "2"
	};

	for (var argName in argNameToDefaultLookup)
	{
		if (args[argName] == null)
		{
			var argValueDefault = argNameToDefaultLookup[argName];
			args[argName] = argValueDefault;
		}
	}

	var servicePort = parseInt(args["--port"]);

	var areAnonymousUsersAllowed =
		(args["--anonymous-users-allowed"] == "true");

	var usersKnown = User.manyFromFilesystemProviderAndPath
	(
		filesystemProvider, "UsersKnown.txt"
	);

	var playersMax = parseInt(args["--players-max"]);
	var arenaSize = parseInt(args["--arena-size"]);
	var planetSize = parseInt(args["--planet-size"]);
	var shipSize = parseInt(args["--ship-size"]);
	var bulletSize = parseInt(args["-bullet-size"]);

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

// Helpers.

function readAndCompileClassFilesInDirectory
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
		readAndCompileClassFilesInDirectory
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
