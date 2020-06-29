
function VisualShape(shape, color)
{
	this.shape = shape;
	this.color = color;
}
{
	VisualShape.prototype.clone = function()
	{
		return new VisualShape(this.shape.clone(), this.color);
	}

	VisualShape.prototype.draw = function(display, body)
	{
		this.shape.draw(display, body.loc, this.color);
	}
}