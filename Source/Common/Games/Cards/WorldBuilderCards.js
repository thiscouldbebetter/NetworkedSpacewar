
class WorldBuilderCards
{
	static build
	(
		arenaSize,
		movableDimension,
		playerSize,
		numberOfPlayers
	)
	{
		var actions = this.build_Actions();

		var bodyDefns = [];

		var cards = CardGroup.deckStandard().cards;

		var cardScaleFactor = 10;

		var cardShape = new ShapeRectangle
		(
			new Coords(2, 3)
				.multiplyScalar(cardScaleFactor)
		);

		var cardBackgroundColor = "White";
		var cardBorderColor = "DarkGray";

		var visualCardBlank =
			new VisualShape
			(
				cardShape,
				cardBackgroundColor,
				cardBorderColor
			);

		var textHeightInPixels = cardScaleFactor;

		var cardsAsBodyDefns = cards.map
		(
			card =>
			{
				var cardSuit = card.suit;
				var cardRank = card.rank;

				var cardText = card.symbol();

				var cardTextColor = cardSuit.color;

				var visual = new VisualGroup
				([
					visualCardBlank,
					new VisualText
					(
						cardText,
						textHeightInPixels,
						cardTextColor
					),
				]);

				return new BodyDefn
				(
					card.name(), 
					null, // categoryNames,
					"White", // color, 
					cardShape,
					visual,
					null, // activity,
					null // actionNames
				);
			}
		);

		var worldSize =
			new Coords(1, 1).multiplyScalar(arenaSize);

		var bodyDefns = [];
		bodyDefns.push(...cardsAsBodyDefns);

		var playerName = "Player"; // todo
		var bodyDefnPlayer = BodyDefn.player(playerName, playerSize);
		bodyDefns.push(bodyDefnPlayer);

		var cellSizeInPixels =
			Coords.ones().multiplyScalar(100);

		var bodyOrientationDefault =
			new Coords(1, 0); // todo

		var bodies = cardsAsBodyDefns.map
		(
			x =>
			{
				var posInCells = Coords.random();

				var defnName = x.name;

				return new Body
				(
					defnName,
					defnName,
					defnName,
					posInCells
						.clone()
						.add(Coords.ones() ) 
						.multiply(cellSizeInPixels),
					bodyOrientationDefault
				)
			}
		);
		
		// todo - Add player body.

		var returnValue = new World
		(
			"WorldCards",
			null, // defn
			20, // ticksPerSecond,
			"Green", // colorBackground
			worldSize,
			actions,
			bodyDefns,
			bodies
		);

		return returnValue;
	}

	static build_Actions()
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

	// Actions.

	static actionActivatePerform(universe, world, body)
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


}