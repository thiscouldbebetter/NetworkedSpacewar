
class ShapeCircle
{
	constructor(radius)
	{
		this.radius = radius;
	}

	clone()
	{
		return new ShapeCircle(this.radius);
	}

	containsPoint(pointToCheck, shapePos)
	{
		var distance = pointToCheck.clone().subtract(shapePos).magnitude();
		var returnValue = (distance <= this.radius);
		return returnValue;
	}

	draw(display, loc, color)
	{
		display.drawCircle(loc.pos, this.radius, color);
	}
}
