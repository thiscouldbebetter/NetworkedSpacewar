
class VisualShape
{
	constructor(shape, color)
	{
		this.shape = shape;
		this.color = color;
	}

	clone()
	{
		return new VisualShape(this.shape.clone(), this.color);
	}

	draw(display, body)
	{
		this.shape.draw(display, body.loc, this.color);
	}
}