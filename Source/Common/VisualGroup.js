
class VisualGroup
{
	constructor(children)
	{
		this.children = children;
	}

	clone()
	{
		return new VisualGroup(this.children.clone());
	}

	draw(display, body)
	{
		for (var i = 0; i < this.children.length; i++)
		{
			var child = this.children[i];
			child.draw(display, body);
		}
	}
}