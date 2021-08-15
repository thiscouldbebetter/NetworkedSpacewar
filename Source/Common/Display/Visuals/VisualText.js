
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

	draw(display, body)
	{
		display.drawText(this.text, body, this.color);
	}
}