
class WorldBuilderChess
{
	build
	(
		arenaSize,
		movableDimension,
		playerSize,
		numberOfPlayers
	)
	{
		arenaSize = arenaSize || new Coords(1, 1).multiplyScalar(256);
		movableDimension = movableDimension || 20;
		playerSize = playerSize || 16;
		numberOfPlayers = numberOfPlayers || 2;

		var actions = this.build_Actions();

		var colors = this.build_Colors();

		var pieceNamesShapesAndCounts =
			this.build_PieceNamesShapesAndCounts();

		var bodyDefns =
			this.build_BodyDefns(colors, pieceNamesShapesAndCounts);

		var worldSize =
			new Coords(1, 1).multiplyScalar(arenaSize);

		var bodies = this.build_Bodies
		(
			bodyDefns,
			colors,
			pieceNamesShapesAndCounts,
			worldSize
		);

		var playerName = "Player"; // todo
		var bodyDefnPlayer = BodyDefn.player(playerName, playerSize);
		bodyDefns.push(bodyDefnPlayer);

		var returnValue = new World
		(
			"World0",
			20, // ticksPerSecond,
			"Green", // colorBackground
			worldSize,
			actions,
			bodyDefns,
			bodies
		);

		return returnValue;
	};

	build_Actions()
	{
		var actions = 
		[
			new Action
			(
				"Activate",
				"MouseDown", // "Enter", // inputName
				// perform
				this.actionActivatePerform
			),

			new Action
			(
				"MoveDown",
				"ArrowDown", // inputName
				// perform
				(universe, world, body) =>
				{
					body.pos.y += 1;
				}
			),

			new Action
			(
				"MoveLeft",
				"ArrowLeft", // inputName
				// perform
				(universe, world, body) =>
				{
					body.pos.x -= 1;
				}
			),

			new Action
			(
				"MoveRight",
				"ArrowRight", // inputName
				// perform
				(universe, world, body) =>
				{
					body.pos.x += 1;
				}
			),

			new Action
			(
				"MoveToMouseCursor",
				"MouseMove", // inputName
				// perform
				(universe, world, body) =>
				{
					var mousePos = universe.inputHelper.mousePos;
					body.pos.overwriteWith(mousePos);
				}
			),

			new Action
			(
				"MoveUp",
				"ArrowUp", // inputName
				// perform
				(universe, world, body) =>
				{
					body.pos.y -= 1;
				}
			),

			new Action
			(
				"Quit",
				"Escape", // inputName
				(universe, world, body) =>
				{
					// todo
				}
			),
		];

		return actions;
	}

	build_Bodies
	(
		bodyDefns,
		colors,
		pieceNamesShapesAndCounts,
		worldSize
	)
	{
		var bodies = [];

		var bodyOrientationDefault = new Coords(1, 0); // todo

		var bodyBoardPos = Coords.zeroes(); // todo

		var bodyDefnBoard = bodyDefns.find(x => x.name == "Board");

		var bodyBoard = new Body
		(
			bodyDefnBoard.name, // id
			"_Board", // name
			bodyDefnBoard.name, // defn
			bodyBoardPos, // pos
			bodyOrientationDefault
		);

		bodies.push(bodyBoard);

		var bodyPosInCells = new Coords();
		var boardSizeInCells = new Coords(8, 8);
		var cellSizeInPixels = new Coords(1, 1).multiplyScalar(50);

		var body = (defnName, index, posInCells) =>
			new Body
			(
				defnName,
				defnName + index,
				defnName,
				posInCells
					.clone()
					.add(Coords.ones() ) 
					.multiply(cellSizeInPixels),
				bodyOrientationDefault
			);

		var bodiesPieces =
		[
			body("Black Rook", 		"0", new Coords(0, 0) ),
			body("Black Knight", 	"0", new Coords(1, 0) ),
			body("Black Bishop", 	"0", new Coords(2, 0) ),
			body("Black Queen", 	"", new Coords(3, 0) ),
			body("Black King", 		"", new Coords(4, 0) ),
			body("Black Bishop", 	"1", new Coords(5, 0) ),
			body("Black Knight", 	"1", new Coords(6, 0) ),
			body("Black Rook", 		"1", new Coords(7, 0) ),

			body("Black Pawn", 		"0", new Coords(0, 1) ),
			body("Black Pawn", 		"1", new Coords(1, 1) ),
			body("Black Pawn", 		"2", new Coords(2, 1) ),
			body("Black Pawn", 		"3", new Coords(3, 1) ),
			body("Black Pawn", 		"4", new Coords(4, 1) ),
			body("Black Pawn", 		"5", new Coords(5, 1) ),
			body("Black Pawn", 		"6", new Coords(6, 1) ),
			body("Black Pawn", 		"7", new Coords(7, 1) ),

			body("White Pawn", 		"0", new Coords(0, 6) ),
			body("White Pawn", 		"1", new Coords(1, 6) ),
			body("White Pawn", 		"2", new Coords(2, 6) ),
			body("White Pawn", 		"3", new Coords(3, 6) ),
			body("White Pawn", 		"4", new Coords(4, 6) ),
			body("White Pawn", 		"5", new Coords(5, 6) ),
			body("White Pawn", 		"6", new Coords(6, 6) ),
			body("White Pawn", 		"7", new Coords(7, 6) ),

			body("White Rook", 		"0", new Coords(0, 7) ),
			body("White Knight", 	"0", new Coords(1, 7) ),
			body("White Bishop", 	"0", new Coords(2, 7) ),
			body("White Queen", 	"", new Coords(3, 7) ),
			body("White King", 		"", new Coords(4, 7) ),
			body("White Bishop", 	"1", new Coords(5, 7) ),
			body("White Knight", 	"1", new Coords(6, 7) ),
			body("White Rook", 		"1", new Coords(7, 7) )
		];

		bodies.push(...bodiesPieces);

		return bodies;
	}

	build_BodyDefnBoard()
	{
		var boardSquareDimension = 100;
		var boardSquareSize = 
			Coords.fromXY(1, 1).multiplyScalar(boardSquareDimension);
		var boardSquareSizeHalf = boardSquareSize.half();
		var boardSquareShape =
			ShapeRectangle.fromSize(boardSquareSize);
		var boardSquareVisualWhite =
			new VisualShape(boardSquareShape, "LightGray", null);
		var boardSquareVisualBlack =
			new VisualShape(boardSquareShape, "DarkGray", null);
		var boardSquareVisualsWhiteAndBlack =
		[
			boardSquareVisualWhite,
			boardSquareVisualBlack
		];

		var boardSquaresAsVisuals = [];

		var boardSizeInSquares = Coords.fromXY(8, 8);
		var boardSquarePosInSquares = Coords.create();
		var boardSquarePosInPixels = Coords.create();

		for (var y = 0; y < boardSizeInSquares.y; y++)
		{
			boardSquarePosInSquares.y = y;

			for (var x = 0; x < boardSizeInSquares.x; x++)
			{
				boardSquarePosInSquares.x = x;

				boardSquarePosInPixels
					.overwriteWith(boardSquarePosInSquares)
					.multiply(boardSquareSize)
					.add(boardSquareSizeHalf);

				var squareIndex = y * boardSizeInSquares.x + x + (y % 2);
				var boardSquareVisualWhiteOrBlack =
					boardSquareVisualsWhiteAndBlack[squareIndex % 2]; // todo

				var visualForSquare = new VisualOffset
				(
					boardSquarePosInPixels.clone(),
					boardSquareVisualWhiteOrBlack
				);

				boardSquaresAsVisuals.push(visualForSquare);
			}
		}

		var boardVisual = new VisualGroup(boardSquaresAsVisuals);

		var bodyDefnBoard = new BodyDefn
		(
			"Board", // name, 
			null, // categoryNames,
			"Cyan", // color, 
			null, // collider,
			boardVisual,
			null, // activity,
			null // actionNames
		);

		return bodyDefnBoard;
	}

	build_BodyDefns(colors, pieceNamesShapesAndCounts)
	{
		var bodyDefns = [];

		for (var c = 0; c < colors.length; c++)
		{
			var color = colors[c];
			var colorOther = colors[1 - c];

			for (var p = 0; p < pieceNamesShapesAndCounts.length; p++)
			{
				var pieceNameShapeAndCount = pieceNamesShapesAndCounts[p];
				var pieceName = pieceNameShapeAndCount[0];
				var pieceShape = pieceNameShapeAndCount[1];

				var bodyDefn = BodyDefn.movable
				(
					color + " " + pieceName, // name
					color,
					colorOther,
					pieceShape
				);

				bodyDefns.push(bodyDefn);
			}
		}

		var bodyDefnBoard = this.build_BodyDefnBoard();
		bodyDefns.push(bodyDefnBoard);

		return bodyDefns;
	}

	build_Colors()
	{
		var colorWhite = "White";
		var colorBlack = "Black";
		var colors = [ colorWhite, colorBlack ];

		return colors;
	}

	build_PieceNamesShapesAndCounts()
	{
		var scaleFactor = 20;

		var shapeBishop = new ShapeGroup
		([
			new ShapePolygon
			([
				new Coords(0, -1),
				new Coords(0.5, 1),
				new Coords(-0.5, 1)
			]),

			new ShapePolygon
			([
				new Coords(0.5, 0),
				new Coords(0, 0.5),
				new Coords(-0.5, 0),
				new Coords(0, -1)
			]).transformTranslate(new Coords(0, -.5) )
		]).transformScale(scaleFactor);

		var shapeKing = new ShapeGroup
		([
			new ShapePolygon
			([
				new Coords(0, -1),
				new Coords(0.5, 1),
				new Coords(-0.5, 1)
			]),

			new ShapePolygon
			([
				new Coords(0.5, 1),
				new Coords(0.5, 0.5),
				new Coords(1, 0.5),
				new Coords(1, -0.5),
				new Coords(0.5, -0.5),
				new Coords(0.5, -1),
				new Coords(-0.5, -1),
				new Coords(-0.5, -0.5),
				new Coords(-1, -0.5),
				new Coords(-1, 0.5),
				new Coords(-0.5, 0.5),
				new Coords(-0.5, 1),
			]).transformScale(.5).transformTranslate
			(
				new Coords(0, -.6)
			)
		]).transformScale(scaleFactor);

		var shapeKnight = new ShapeGroup
		([
			new ShapePolygon
			([
				new Coords(0, -1),
				new Coords(0.5, 1),
				new Coords(-0.5, 1)
			]),

			new ShapePolygon
			([
				new Coords(1, 0),
				new Coords(0, 0.5),
				new Coords(-0.5, 0),
				new Coords(0, -0.5)
			]).transformTranslate(new Coords(0, -.4) )
		]).transformScale(scaleFactor);

		var shapePawn = new ShapeGroup
		([
			new ShapePolygon
			([
				new Coords(0, -.5),
				new Coords(0.5, 1),
				new Coords(-0.5, 1)
			]),

			new ShapePolygon
			([
				new Coords(0.5, 0),
				new Coords(0.3, 0.3),
				new Coords(0, 0.5),
				new Coords(-0.3, 0.3),
				new Coords(-0.5, 0),
				new Coords(-0.3, -0.3),
				new Coords(0, -0.5),
				new Coords(0.3, -0.3)
			]).transformTranslate(new Coords(0, -.2) )
		]).transformScale(scaleFactor);

		var shapeQueen = new ShapeGroup
		([
			new ShapePolygon
			([
				new Coords(0, -1),
				new Coords(0.5, 1),
				new Coords(-0.5, 1)
			]),

			new ShapePolygon
			([
				new Coords(.5, 1),
				new Coords(-.5, 1),
				new Coords(-1, -1),
				new Coords(0, 0),
				new Coords(1, -1)
			]).transformScale(.5).transformTranslate
			(
				new Coords(0, -.8)
			)
		]).transformScale(scaleFactor);

		var shapeRook = new ShapeGroup
		([
			new ShapePolygon
			([
				new Coords(0, -1),
				new Coords(0.5, 1),
				new Coords(-0.5, 1)
			]),

			new ShapePolygon
			([
				new Coords(1, .8),
				new Coords(-1, .8),
				new Coords(-1, -.8),
				new Coords(1, -.8)
			]).transformScale(.5).transformTranslate
			(
				new Coords(0, -.8)
			)
		]).transformScale(scaleFactor);

		var pieceNamesShapesAndCounts =
		[
			[ "Bishop", shapeBishop, 2 ],
			[ "King", shapeKing, 1 ],
			[ "Knight", shapeKnight, 2 ],
			[ "Pawn", shapePawn, 8 ],
			[ "Queen", shapeQueen, 1 ],
			[ "Rook", shapeRook, 2 ],
		];

		return pieceNamesShapesAndCounts;
	}

	// Actions.

	actionActivatePerform(universe, world, body)
	{
		universe.inputHelper.inputRemove("MouseDown");

		var player = body;
		var playerPos = player.pos;
		if (player.bodyHeld == null)
		{
			var movablesAtPos =
				world.movablesAtPosAddToList(playerPos, []);
			if (movablesAtPos.length > 0)
			{
				var movableToPickUp = movablesAtPos[0];
				world.bodyRemove(movableToPickUp);
				player.bodyHeld = movableToPickUp;
			}
		}
		else
		{
			var movableToDrop = player.bodyHeld;
			player.bodyHeld = null;
			movableToDrop.pos.overwriteWith(playerPos);
			world.bodySpawn
			(
				movableToDrop,
				false // spawnUnder
			);
		}
	}

	buildDefault()
	{
		return this.build(null, null, null, null);
	}

}