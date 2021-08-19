
class Activity
{
	constructor(name, perform)
	{
		this.name = name;
		this.perform = perform;

		this.actionCodes = [];
	}

	clone()
	{
		return new Activity(this.name, this.perform);
	}
}
