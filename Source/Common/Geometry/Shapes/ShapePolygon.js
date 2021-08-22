
class ShapePolygon
{
	constructor(vertices)
	{
		this.verticesAtRest = vertices;

		this.veritcesTransformed = this.verticesAtRest.clone();
	}

	clone()
	{
		return new ShapePolygon(this.vertices.clone());
	}

	draw(display, loc, color)
	{
		this.verticesTransformed.overwriteWith(this.verticesAtRest);
		this.transform.loc.overwriteWith(loc);
		this.transform.applyToPoints(this.verticesTransformed);
		display.drawPolygon(loc.pos, this.radius, color);
	}
}