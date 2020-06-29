
function ShapeRay(length)
{
	this.length = length;
}
{
	ShapeRay.prototype.clone = function()
	{
		return new ShapeRay(this.length);
	}

	ShapeRay.prototype.draw = function(display, loc, color)
	{
		display.drawRay(loc.pos, loc.orientation, this.length, color);
	}
}