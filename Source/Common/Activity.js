
function Activity(name, perform)
{
	this.name = name;
	this.perform = perform;

	this.actionNames = [];
}

{
	Activity.prototype.clone = function()
	{
		return new Activity(this.name, this.perform);
	};
}
