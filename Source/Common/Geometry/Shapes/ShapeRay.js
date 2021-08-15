
class ShapeRay
{
	constructor(length)
	{
		this.length = length;
	}

	clone()
	{
		return new ShapeRay(this.length);
	}

	draw(display, loc, color)
	{
		display.drawRay(loc.pos, loc.orientation.forward, this.length, color);
	}
}
