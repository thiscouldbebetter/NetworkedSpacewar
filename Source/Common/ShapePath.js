
function ShapePolygon(vertices)
{
	this.verticesAtRest = vertices;

	this.veritcesTransformed = this.verticesAtRest.clone();
}
{
	ShapePolygon.prototype.clone = function()
	{
		return new ShapePolygon(this.vertices.clone());
	}

	ShapePolygon.prototype.draw = function(display, loc, color)
	{
		this.verticesTransformed.overwriteWith(this.verticesAtRest);
		this.transform.loc.overwriteWith(loc);
		this.transform.applyToPoints(this.verticesTransformed);
		display.drawPolygon(loc.pos, this.radius, color);
	}
}