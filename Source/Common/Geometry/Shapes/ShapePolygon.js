
class ShapePolygon
{
	constructor(vertices)
	{
		this.verticesAtRest = vertices;

		this._verticesTransformed = null;
	}

	clone()
	{
		return new ShapePolygon(this.vertices.clone());
	}

	draw(display, loc, color)
	{
		// todo
		this.verticesTransformed.overwriteWith(this.verticesAtRest);
		this.transform.loc.overwriteWith(loc);
		this.transform.applyToPoints(this.verticesTransformed);
		display.drawPolygon(this.verticesTransformed, color);
	}

	verticesTransformed()
	{
		if (this._verticesTransformed == null)
		{
			this._verticesTransformed = this.verticesAtRest.map(x => x.clone() );
		}
		return this._verticesTransformed;
	}

	transformScale(scaleFactor)
	{
		this.verticesAtRest.forEach(x => x.multiplyScalar(scaleFactor) );
		return this;
	}

	transformTranslate(offset)
	{
		this.verticesAtRest.forEach(x => x.add(offset) );
		return this;
	}
}