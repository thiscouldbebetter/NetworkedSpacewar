
class Update_Instances
{
	constructor()
	{
		this.Actions = new Update_Actions();
		this.BodyCreate = new Update_BodyCreate();
		this.BodyDefnRegister = new Update_BodyDefnRegister();
		this.BodyRemove = new Update_BodyRemove();
		this.Group = new Update_Group();
		this.Physics = new Update_Physics();

		this._All =
		[
			this.Actions,
			this.BodyCreate,
			this.BodyDefnRegister,
			this.BodyRemove,
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
