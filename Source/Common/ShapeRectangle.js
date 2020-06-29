
function ShapeRectangle(size)
{
	this.size = size;
}
{
	ShapeRectangle.prototype.clone = function()
	{
		return new ShapeRectangle(this.size.clone());
	}

	ShapeRectangle.prototype.containsPointForPos = function(pointToCheck, shapePos)
	{
		var posRelative =
			this.size.clone().half().invert().add(shapePos).invert().add(pointToCheck);
		var returnValue = posRelative.isInRangeMax(this.size);
		return returnValue;
	}

	ShapeRectangle.prototype.draw = function(display, pos, color)
	{
		display.drawRectangle(pos, this.size, color);
	}
}