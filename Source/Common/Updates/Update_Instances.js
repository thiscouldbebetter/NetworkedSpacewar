
class Update_Instances
{
	constructor()
	{
		this.Actions = new Update_Actions();
		this.EntityCreate = new Update_EntityCreate();
		this.EntityDefnRegister = new Update_EntityDefnRegister();
		this.EntityRemove = new Update_EntityRemove();
		this.Group = new Update_Group();
		this.Physics = new Update_Physics();

		this._All =
		[
			this.Actions,
			this.EntityCreate,
			this.EntityDefnRegister,
			this.EntityRemove,
			this.Group,
			this.Physics
		];

		this._AllByCode = new Map
		(
			this._All.map
			(
				(x, i) => [i, x]
			)
		);
	}

	byCode(code)
	{
		return this._AllByCode.get(code);
	}

	codeForUpdate(update)
	{
		var updateTypeName = update.constructor.name;
		var updateMatching =
			this._All.filter(x => x.constructor.name == updateTypeName)[0];
		var updateCode = this._All.indexOf(updateMatching);
		return updateCode;
	}
}
