
class WorldBuilderChess
{
	build
	(
		arenaDimension,
		movableDimension,
		playerSize,
		numberOfPlayers
	)
	{
		arenaDimension = arenaDimension || 256;
		var arenaSize = new Coords(1, 1).multiplyScalar(arenaDimension);
		movableDimension = movableDimension || 20;
		playerSize = playerSize || 16;
		numberOfPlayers = numberOfPlayers || 2;

		var actions = this.build_Actions();

		var colors = this.build_Colors();

		var pieceNamesShapesAndCounts =
			this.build_PieceNamesShapesAndCounts();

		var entityDefns =
			this.build_entityDefns(colors, pieceNamesShapesAndCounts);

		var worldSize = arenaSize;

		var entities = this.build_Entities
		(
			entityDefns,
			colors,
			pieceNamesShapesAndCounts,
			worldSize
		);

		var playerName = "Player"; // todo
		var entityDefnChessBuilder = new EntityDefnChessBuilder();
		var entityDefnPlayer = entityDefnChessBuilder.player(playerName, playerSize);
		entityDefns.push(entityDefnPlayer);

		var defn = new WorldDefnChess();

		var returnValue = new World
		(
			"World0",
			defn,
			20, // ticksPerSecond,
			worldSize,
			2, // playersMax
			actions,
			entityDefns,
			entities
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
				(universe, world, entity) =>
				{
					entity.pos.y += 1;
				}
			),

			new Action
			(
				"MoveLeft",
				"ArrowLeft", // inputName
				// perform
				(universe, world, entity) =>
				{
					entity.pos.x -= 1;
				}
			),

			new Action
			(
				"MoveRight",
				"ArrowRight", // inputName
				// perform
				(universe, world, entity) =>
				{
					entity.pos.x += 1;
				}
			),

			new Action
			(
				"MoveToMouseCursor",
				"MouseMove", // inputName
				// perform
				(universe, world, entity) =>
				{
					var mousePos = universe.inputHelper.mousePos;
					entity.pos.overwriteWith(mousePos);
				}
			),

			new Action
			(
				"MoveUp",
				"ArrowUp", // inputName
				// perform
				(universe, world, entity) =>
				{
					entity.pos.y -= 1;
				}
			),

			new Action
			(
				"Quit",
				"Escape", // inputName
				(universe, world, entity) =>
				{
					// todo
				}
			),
		];

		return actions;
	}

	build_Entities
	(
		entityDefns,
		colors,
		pieceNamesShapesAndCounts,
		worldSize
	)
	{
		var entities = [];

		var entityBoardPos = Coords.zeroes(); // todo

		var entityDefnBoard = entityDefns.find(x => x.name == "Board");

		var entityBoardLoc = Location.fromPos
		(
			entityBoardPos
		);

		var entityBoard = Entity.fromIdNameDefnNameAndLoc
		(
			entityDefnBoard.name, // id
			"_Board", // name
			entityDefnBoard.name, // defn
			entityBoardLoc
		);

		entities.push(entityBoard);

		var entityPosInCells = new Coords();
		var boardSizeInCells = new Coords(8, 8);
		var cellSizeInPixels = new Coords(1, 1).multiplyScalar(50);

		var entity = (defnName, index, posInCells) =>
			Entity.fromIdNameDefnNameAndLoc
			(
				defnName,
				defnName + index,
				defnName,
				Location.fromPos
				(
					posInCells
						.clone()
						.add(Coords.ones() ) 
						.multiply(cellSizeInPixels)
				)
			);

		var entitiesPieces =
		[
			entity("Black Rook", 		"0", new Coords(0, 0) ),
			entity("Black Knight", 		"0", new Coords(1, 0) ),
			entity("Black Bishop", 		"0", new Coords(2, 0) ),
			entity("Black Queen", 		"", new Coords(3, 0) ),
			entity("Black King", 		"", new Coords(4, 0) ),
			entity("Black Bishop", 		"1", new Coords(5, 0) ),
			entity("Black Knight", 		"1", new Coords(6, 0) ),
			entity("Black Rook", 		"1", new Coords(7, 0) ),

			entity("Black Pawn", 		"0", new Coords(0, 1) ),
			entity("Black Pawn", 		"1", new Coords(1, 1) ),
			entity("Black Pawn", 		"2", new Coords(2, 1) ),
			entity("Black Pawn", 		"3", new Coords(3, 1) ),
			entity("Black Pawn", 		"4", new Coords(4, 1) ),
			entity("Black Pawn", 		"5", new Coords(5, 1) ),
			entity("Black Pawn", 		"6", new Coords(6, 1) ),
			entity("Black Pawn", 		"7", new Coords(7, 1) ),

			entity("White Pawn", 		"0", new Coords(0, 6) ),
			entity("White Pawn", 		"1", new Coords(1, 6) ),
			entity("White Pawn", 		"2", new Coords(2, 6) ),
			entity("White Pawn", 		"3", new Coords(3, 6) ),
			entity("White Pawn", 		"4", new Coords(4, 6) ),
			entity("White Pawn", 		"5", new Coords(5, 6) ),
			entity("White Pawn", 		"6", new Coords(6, 6) ),
			entity("White Pawn", 		"7", new Coords(7, 6) ),

			entity("White Rook", 		"0", new Coords(0, 7) ),
			entity("White Knight", 	"0", new Coords(1, 7) ),
			entity("White Bishop", 	"0", new Coords(2, 7) ),
			entity("White Queen", 	"", new Coords(3, 7) ),
			entity("White King", 		"", new Coords(4, 7) ),
			entity("White Bishop", 	"1", new Coords(5, 7) ),
			entity("White Knight", 	"1", new Coords(6, 7) ),
			entity("White Rook", 		"1", new Coords(7, 7) )
		];

		entities.push(...entitiesPieces);

		return entities;
	}

	build_entityDefnBoard()
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

		var entityDefnBoard = new EntityDefnChess
		(
			"Board", // name, 
			null, // categoryNames,
			"Cyan", // color, 
			null, // collider,
			boardVisual,
			null, // activity,
			null // actionNames
		);

		return entityDefnBoard;
	}

	build_entityDefns(colors, pieceNamesShapesAndCounts)
	{
		var entityDefns = [];
		var entityDefnChessBuilder = new EntityDefnChessBuilder();

		for (var c = 0; c < colors.length; c++)
		{
			var color = colors[c];
			var colorOther = colors[1 - c];

			for (var p = 0; p < pieceNamesShapesAndCounts.length; p++)
			{
				var pieceNameShapeAndCount = pieceNamesShapesAndCounts[p];
				var pieceName = pieceNameShapeAndCount[0];
				var pieceShape = pieceNameShapeAndCount[1];

				var entityDefn = entityDefnChessBuilder.movable
				(
					color + " " + pieceName, // name
					color,
					colorOther,
					pieceShape
				);

				entityDefns.push(entityDefn);
			}
		}

		var entityDefnBoard = this.build_entityDefnBoard();
		entityDefns.push(entityDefnBoard);

		return entityDefns;
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

	actionActivatePerform(universe, world, entity)
	{
		universe.inputHelper.inputRemove("MouseDown");

		var player = entity;
		var playerPos = player.pos;
		if (player.entityHeld == null)
		{
			var movablesAtPos =
				world.movablesAtPosAddToList(playerPos, []);
			if (movablesAtPos.length > 0)
			{
				var movableToPickUp = movablesAtPos[0];
				world.entityRemove(movableToPickUp);
				player.entityHeld = movableToPickUp;
			}
		}
		else
		{
			var movableToDrop = player.entityHeld;
			player.entityHeld = null;
			movableToDrop.pos.overwriteWith(playerPos);
			world.entitySpawn
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