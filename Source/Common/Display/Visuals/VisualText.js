
class VisualText
{
	constructor(text, color)
	{
		this.text = text;
		this.color = color;
	}

	clone()
	{
		return new VisualText(this.text, this.color);
	}

	draw(display, entity)
	{
		display.drawText(this.text, entity, this.color);
	}
}