
class EntityDefnChess
{
	constructor
	(
		name, 
		categoryNames,
		color, 
		collider,
		visual,
		activity,
		actionNames
	)
	{
		this.name = name;
		this.categoryNames = categoryNames || [];
		this.color = color || "Gray";
		this.collider = collider;
		this.visual = visual;
		this.activity = activity;
		this.actionNames = actionNames || [];
	}

	// instance methods

	actionNamesContains(name)
	{
		return (this.actionNames.indexOf(name) >= 0);
	}

	entityInitializeForWorld(entity, world)
	{
		// todo
	}

	movable()
	{
		return (this.categoryNames.indexOf("Movable") >= 0);
	}

	// Clonable.

	clone()
	{
		return new EntityDefnChess
		(
			this.name, 
			this.categoryNames,
			this.color, 
			this.collider.clone(), 
			this.visual.clone(),
			this.activity.clone(),
			this.actionNames
		);
	};
}