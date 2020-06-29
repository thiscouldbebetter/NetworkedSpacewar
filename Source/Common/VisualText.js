
function VisualText(text, color)
{
	this.text = text;
	this.color = color;
}
{
	VisualText.prototype.clone = function()
	{
		return new VisualText(this.text, this.color);
	}

	VisualText.prototype.draw = function(display, body)
	{
		display.drawText(this.text, body, this.color);
	}
}