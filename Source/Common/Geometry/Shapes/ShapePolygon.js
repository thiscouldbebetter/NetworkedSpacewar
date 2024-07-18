
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
		var pos = loc.pos;
		var verticesTransformed = this.verticesTransformed();
		verticesTransformed.forEach
		(
			(x, i) => x.overwriteWith(this.verticesAtRest[i]).add(pos)
		);
		// this.transform.loc.overwriteWith(loc);
		// this.transform.applyToPoints(this.verticesTransformed);
		display.drawPolygon(verticesTransformed, color);
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