
class EntityDefnSpacewar
{
	constructor
	(
		name,
		categoryNames,
		color,
		integrityMax,
		ticksToLive,
		massInKg,
		speedMax,
		accelerationPerTick,
		turnRate,
		energyMax,
		energyPerTick,
		collider,
		activity,
		actionCodes,
		devices,
		collide,
		visual
	)
	{
		this.name = name;
		this.categoryNames = categoryNames;
		this.color = color;
		this.integrityMax = integrityMax;
		this.ticksToLive = ticksToLive;
		this.massInKg = massInKg;
		this.speedMax = speedMax;
		this.accelerationPerTick = accelerationPerTick;
		this.turnRate = turnRate;
		this.energyMax = energyMax;
		this.energyPerTick = energyPerTick;
		this.collider = collider;
		this.activity = activity;
		this.actionCodes = actionCodes;
		this.devices = devices;
		this.collide = collide;
		this.visual = visual;
	}

	// Activities.

	static activityUserInputAcceptPerform(universe, world, actor, activity)
	{
		var inputHelper = universe.inputHelper;

		if (inputHelper == null)
		{
			return; // hack - This is happening on the server, not client.
		}

		activity.actionCodes.length = 0;

		var entityDefn = actor.defn(world);

		var inputNamesActive = inputHelper.inputNamesActive;
		for (var i = 0; i < inputNamesActive.length; i++)
		{
			var inputNameActive = inputNamesActive[i];
			var action =
				world.actionByInputName(inputNameActive);
			if (action != null)
			{
				var actionCode = action.code;
				if (entityDefn.actionCodes.indexOf(actionCode) >= 0)
				{
					activity.actionCodes.push(actionCode);
				}
			}
		}

		if (activity.actionCodes.length > 0)
		{
			var bodyId = actor.id; // todo

			var update = new Update_Actions
			(
				bodyId,
				activity.actionCodes
			);

			world.updatesOutgoing.push(update);
		}
	}

	// instance methods

	clone()
	{
		return new EntityDefnSpacewar
		(
			this.name,
			this.categoryNames,
			this.color,
			this.integrityMax,
			this.ticksToLive,
			this.massInKg,
			this.speedMax,
			this.accelerationPerTick,
			this.turnRate,
			this.energyMax,
			this.energyPerTick,
			this.collider.clone(),
			this.activity.clone(),
			this.actionCodes,
			this.devices,
			this.collide,
			this.visual
		);
	}
}
