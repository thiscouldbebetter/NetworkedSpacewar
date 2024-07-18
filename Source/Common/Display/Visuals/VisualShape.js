
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

	draw(display, entity)
	{
		this.shape.draw(display, entity.loc, this.color);
	}
}
