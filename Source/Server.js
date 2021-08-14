import { createRequire } from 'module';
const require = createRequire(import.meta.url);

var classesByName = readAndCompileClassFiles();

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

	handleEvent_ClientIdentifyingSelf(clientName)
	{
		this.clientName = clientName;

		var server = this.server;

		var clientConnection = server.clientConnections[this.clientID];
		var socketToClient = clientConnection.socket;

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
	constructor(portToListenOn, world)
	{
		this.portToListenOn = portToListenOn;
		this.world = world;
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
		"--port" : "8089",
		"-a" : "128",
		"-p" : "10",
		"-s" : "3",
		"-b" : "1"
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
	var arenaSize = parseInt(args["-a"]);
	var planetSize = parseInt(args["-p"]);
	var shipSize = parseInt(args["-s"]);
	var bulletSize = parseInt(args["-b"]);

	var world = World.build
	(
		arenaSize, planetSize, shipSize, bulletSize
	);

	new Server(servicePort, world).initialize();
}

main();


// Helpers.

function readAndCompileClassFiles()
{
	var fs = require("fs");

	var commonDirectoryPath = "./Common";

	var sourceFilePathsWithinCommon = fs.readdirSync(commonDirectoryPath);

	var sourceFilePathsAbsolute = sourceFilePathsWithinCommon.map
	(
		x => commonDirectoryPath + "/" + x
	);

	var fileExtensionJs = ".js";

	sourceFilePathsAbsolute =
		sourceFilePathsAbsolute.filter(x => x.endsWith(fileExtensionJs));

	var classesByName = new Map();

	for (var i = 0; i < sourceFilePathsAbsolute.length; i++)
	{
		var sourceFilePathAbsolute = sourceFilePathsAbsolute[i];
		var filePathAsParts = sourceFilePathAbsolute.split("/");
		var fileName = filePathAsParts[filePathAsParts.length - 1];
		var className = fileName.split(".")[0];
		var codeBlockToCompile =
			fs.readFileSync(sourceFilePathAbsolute).toString();
		var codeBlockToCompileWrapped =
			"(" + codeBlockToCompile + ")";
		var classCompiled = eval(codeBlockToCompileWrapped);
		classesByName.set(className, classCompiled);
	}

	return classesByName;
}
