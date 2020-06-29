
function Location(pos, orientation)
{
	this.pos = pos || new Coords(0, 0);
	this.orientation = orientation || new Coords(1, 0);

	this.right = this.orientation.clone().right();
}
{
	Location.prototype.clone = function()
	{
		return new Location(this.pos.clone(), this.orientation.clone());
	};

	Location.prototype.overwriteWith = function(other)
	{
		this.pos.overwriteWith(other.pos);
		this.orientation.overwriteWith(other.orientation);
		this.right.overwriteWith(other.right);
	};
}