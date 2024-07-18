
class VisualGroup
{
	constructor(children)
	{
		this.children = children;
	}

	clone()
	{
		return new VisualGroup
		(
			this.children.map(x => x.clone() )
		);
	}

	draw(display, entity)
	{
		for (var i = 0; i < this.children.length; i++)
		{
			var child = this.children[i];
			child.draw(display, entity);
		}
	}
}