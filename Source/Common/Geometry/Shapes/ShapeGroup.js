
class ShapeGroup
{
	constructor(children)
	{
		this.children = children;
	}

	boundingRectangle()
	{
		if (this._boundingRectangle == null)
		{
			var childRectangles =
				this.children.map(x => x.boundingRectangle() );

			var childRectangle0 = childRectangles[0];

			var minSoFar = childRectangle0.min().clone();
			var maxSoFar = childRectangle0.max().clone();

			for (var i = 1; i < childRectangles.length; i++)
			{
				var childRectangle = childRectangles[i];

				var childRectangleMin = childRectangle.min();
				var childRectangleMax = childRectangle.max();

				if (childRectangleMin.x < minSoFar.x)
				{
					minSoFar.x = childRectangleMin.x;
				}
				if (childRectangleMax.x > maxSoFar.x)
				{
					maxSoFar.x = childRectangleMax.x;
				}

				if (childRectangleMin.y < minSoFar.y)
				{
					minSoFar.y = childRectangleMin.y;
				}
				if (childRectangleMax.y > maxSoFar.y)
				{
					maxSoFar.y = childRectangleMax.y;
				}
			}

			var size = maxSoFar.subtract(minSoFar);

			this._boundingRectangle = new ShapeRectangle(size);
		}

		return this._boundingRectangle;
	}

	containsPointForPos(pointToCheck, shapePos)
	{
		return this.children.some(x => x.containsPointForPos(pointToCheck, shapePos) );
	}

	draw(display, pos, colorFill, colorBorder)
	{
		this.children.forEach
		(
			x => x.draw(display, pos, colorFill, colorBorder)
		);
	}

	transformScale(scaleFactor)
	{
		this.children.forEach(x => x.transformScale(scaleFactor) );
		return this;
	}
}