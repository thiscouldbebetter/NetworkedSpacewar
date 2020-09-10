
class Activity
{
	constructor(name, perform)
	{
		this.name = name;
		this.perform = perform;

		this.actionNames = [];
	}

	clone()
	{
		return new Activity(this.name, this.perform);
	}
}
