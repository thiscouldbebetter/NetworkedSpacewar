
class ShapeRectangle
{
	constructor(size)
	{
		this.size = size;
	}

	static fromSize(size)
	{
		return new ShapeRectangle(size);
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

	draw(display, loc, colorFill, colorBorder)
	{
		display.drawRectangle(loc.pos, this.size, colorFill, colorBorder);
	}
}