
class VisualOffset
{
	constructor(offset, child)
	{
		this.offset = offset || Coords.zeroes();
		this.child = child;
	}

	draw(display, entity)
	{
		var pos = entity.loc.pos;
		pos.add(this.offset);
		this.child.draw(display, entity);
		pos.subtract(this.offset);
	}
}