
class ShapeRectangle
{
	constructor(size)
	{
		this.size = size;
	}

	clone()
	{
		return new ShapeRectangle(this.size.clone());
	}

	containsPointForPos(pointToCheck, shapePos)
	{
		var posRelative =
			this.size.clone().half().invert().add(shapePos).invert().add(pointToCheck);
		var returnValue = posRelative.isInRangeMax(this.size);
		return returnValue;
	}

	draw(display, pos, color)
	{
		display.drawRectangle(pos, this.size, color);
	}
}