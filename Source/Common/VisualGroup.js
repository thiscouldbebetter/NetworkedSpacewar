
function VisualGroup(children)
{
	this.children = children;
}
{
	VisualGroup.prototype.clone = function()
	{
		return new VisualGroup(this.children.clone());
	}

	VisualGroup.prototype.draw = function(display, body)
	{
		for (var i = 0; i < this.children.length; i++)
		{
			var child = this.children[i];
			child.draw(display, body);
		}
	}
}