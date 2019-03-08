var fs = require("fs");
var commonFiles = fs.readdirSync("./Common");
for (var i = 0; i < commonFiles.length; i++)
{
	var fileName = commonFiles[i];
	eval(fs.readFileSync("./Common/" + fileName).toString());
}

function ClientConnection(server, clientID, socket)
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
{	
	ClientConnection.prototype.handleEvent_ClientDisconnected = function()
	{
		console.log("Someone left the server.")
		var bodies = this.server.world.bodies;
		var bodyToDestroy = bodies[this.clientID];
		if (bodyToDestroy != null)
		{
			bodyToDestroy.integrity = 0;
		}
	}
	
	ClientConnection.prototype.handleEvent_ClientIdentifyingSelf = function(clientName)
	{
		this.clientName = clientName;
		
		var server = this.server;

		var clientConnection = server.clientConnections[this.clientID];
		var socketToClient = clientConnection.socket;
		
		var session = new Session(this.clientID, server.world);
		var sessionSerialized = server.serializer.serialize(session);
		socketToClient.emit("sessionEstablished", sessionSerialized);
	
		var world = server.world;
		var bodyDefnPlayer = world.bodyDefns["_Player"];
		var bodyDefnForClient = bodyDefnPlayer.clone();
		bodyDefnForClient.name = this.clientID;
		bodyDefnForClient.color = ColorHelper.random();

		var updateBodyDefnRegister = new Update_BodyDefnRegister
		(
			bodyDefnForClient
		);
		updateBodyDefnRegister.updateWorld(world);
		world.updatesOutgoing.push(updateBodyDefnRegister);

		var bodyForClient = new Body
		(
			this.clientID, // id
			clientName, // name
			bodyDefnForClient.name,
			new Coords().randomize().multiply(world.size),
			new Coords().randomize().normalize()
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
	
	ClientConnection.prototype.handleEvent_ClientUpdateReceived = function(updateSerialized)
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
			if (updateCode == Update_Actions.UpdateCode)
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

function Server(portToListenOn, world)
{
	this.portToListenOn = portToListenOn;
	this.world = world;
}
{
	Server.prototype.initialize = function()
	{
		this.clientConnections = [];
		
		Log.IsEnabled = true;

		this.serializer = new Serializer;

		this.clientID = IDHelper.IDNext();

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

	Server.prototype.updateForTick = function()
	{
		var world = this.world;

		world.updateForTick_UpdatesApply(this.updatesIncoming);

		world.updateForTick_Spawn();

		this.updateForTick_Server();

		world.updateForTick_UpdatesApply(world.updatesImmediate);

		world.updateForTick_Remove();

		this.updateForTick_UpdatesOutgoingSend();
	}

	Server.prototype.updateForTick_Server = function()
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

	Server.prototype.updateForTick_UpdatesOutgoingSend = function()
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

	Server.prototype.handleEvent_ClientConnecting = function(socketToClient)
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
