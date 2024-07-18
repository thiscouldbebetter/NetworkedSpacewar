
class VisualShape
{
	constructor(shape, colorFill, colorBorder)
	{
		this.shape = shape;
		this.colorFill = colorFill;
		this.colorBorder = colorBorder;
	}

	clone()
	{
		return new VisualShape(this.shape.clone(), this.colorFill, this.colorBorder);
	}

	draw(display, entity)
	{
		this.shape.draw(display, entity.loc, this.colorFill, this.colorBorder);
	}
}
