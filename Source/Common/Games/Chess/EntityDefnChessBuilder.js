
class EntityDefnChessBuilder
{
	movable(name, colorFill, colorBorder, shape)
	{
		var collider = shape;
		var visualColor = colorFill;
		var heightInPixels = 10; // todo
		var visual = new VisualGroup
		([
			new VisualShape(shape, visualColor, colorBorder),
			//new VisualText(name, heightInPixels, visualColor, colorBorder)
		]);
		
		var returnValue = new EntityDefn
		(
			name,
			[ "Movable" ], // categoryNames
			colorFill,
			collider,
			visual,
			null, // activity 
			[] // actionNames
		);

		return returnValue;
	}

	player(name, dimension)
	{
		var color = ColorHelper.random();

		var activityUserInputAccept = new Activity
		(
			"UserInputAccept",
			// perform
			(world, inputHelper, actor, activity) =>
			{
				if (inputHelper == null)
				{
					return;
				}

				var activityActionNames = activity.actionNames;
				activityActionNames.length = 0;

				var EntityDefn = actor.defn(world);

				var inputNamesActive = inputHelper.inputNamesActive;
				for (var i = 0; i < inputNamesActive.length; i++)
				{
					var inputNameActive = inputNamesActive[i];
					var action = world.actionByInputName(inputNameActive);
					if (action != null)
					{
						var actionName = action.name;
						if (EntityDefn.actionNamesContains(actionName))
						{
							activityActionNames.push(actionName);
						}
					}
				}

				if (activityActionNames.length > 0)
				{
					var update = new Update_Actions
					(
						actor.id,
						activityActionNames
					);

					world.updatesOutgoing.push(update);
				}
			}
		);

		var shape = new ShapeCircle(dimension);
		var collider = shape;
		var visualColorBorder = color;
		var fontHeightInPixels = 10; // todo
		var visualColorFill = "White";
		var visual = new VisualGroup
		([
			new VisualShape(shape, visualColorFill, visualColorBorder),
			new VisualText("Player", fontHeightInPixels, visualColorBorder)
		]);

		var returnValue = new EntityDefn
		(
			name,
			[ "Player" ], // categoryNames
			color,
			collider,
			visual,
			activityUserInputAccept, // activity
			[ "Activate", "MoveDown", "MoveLeft", "MoveRight", "MoveUp", "MoveToMouseCursor" ], // actionNames
		);

		return returnValue;
	};

	playerScreen(dimension)
	{
		var color = "Gray";

		var shape = new ShapeRectangle(new Coords(1, 1).multiplyScalar(dimension));
		var fontHeightInPixels = 10;
		var collider = shape;
		var visualColor = color;
		var visual = new VisualGroup
		([
			new VisualShape(shape, visualColor),
			new VisualText("PlayerScreen", fontHeightInPixels, visualColor)
		]);

		var returnValue = new EntityDefn
		(
			"PlayerScreen",
			[ "PlayerScreen" ], // categoryNames
			color,
			collider,
			visual,
			null, // activity 
			[] // actionNames
		);

		return returnValue;
	}

}