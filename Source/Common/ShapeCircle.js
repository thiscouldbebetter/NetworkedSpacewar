
function ShapeCircle(radius)
{
	this.radius = radius;
}
{
	ShapeCircle.prototype.clone = function()
	{
		return new ShapeCircle(this.radius);
	}

	ShapeCircle.prototype.containsPoint = function(pointToCheck, shapePos)
	{
		var distance = pointToCheck.clone().subtract(shapePos).magnitude();
		var returnValue = (distance <= this.radius);
		return returnValue;
	}

	ShapeCircle.prototype.draw = function(display, loc, color)
	{
		display.drawCircle(loc.pos, this.radius, color);
	}
}