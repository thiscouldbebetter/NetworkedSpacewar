
class Coords
{
	constructor(x, y)
	{
		this.x = x;
		this.y = y;
	}

	static NumberOfDimensions() { return 2 };

	// instance methods

	add(other)
	{
		this.x += other.x;
		this.y += other.y;
		return this;
	}

	clear()
	{
		this.x = 0;
		this.y = 0;
		return this;
	}

	clone()
	{
		return new Coords(this.x, this.y);
	}

	dimension(dimensionIndex)
	{
		var returnValue;

		if (dimensionIndex == 0)
		{
			returnValue = this.x;
		}
		else
		{
			returnValue = this.y;
		}

		return returnValue;
	}

	divide(other)
	{
		this.x /= other.x;
		this.y /= other.y;
		return this;
	}

	divideScalar(scalar)
	{
		this.x /= scalar;
		this.y /= scalar;
		return this;
	}

	dotProduct(other)
	{
		return this.x * other.x  + this.y * other.y;
	}

	magnitude()
	{
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	multiply(other)
	{
		this.x *= other.x;
		this.y *= other.y;
		return this;
	}

	multiplyScalar(scalar)
	{
		this.x *= scalar;
		this.y *= scalar;
		return this;
	}

	normalize()
	{
		return this.divideScalar(this.magnitude());
	}

	overwriteWith(other)
	{
		this.x = other.x;
		this.y = other.y;
		return this;
	}

	overwriteWithDimensions(x, y)
	{
		this.x = x;
		this.y = y;
		return this;
	}

	randomize()
	{
		this.x = Math.random();
		this.y = Math.random();
		return this;
	}

	right()
	{
		var temp = this.y;
		this.y = this.x;
		this.x = 0 - temp;
		return this;
	}

	subtract(other)
	{
		this.x -= other.x;
		this.y -= other.y;
		return this;
	}

	toString()
	{
		return "(" + this.x + "," + this.y + ")";
	}

	trimToMagnitude(magnitudeMax)
	{
		var magnitude = this.magnitude();

		if (magnitude > magnitudeMax)
		{
			this.divideScalar
			(
				magnitude
			).multiplyScalar
			(
				magnitudeMax
			);
		}

		return this;
	}

	wrapToRange(max)
	{
		while (this.x < 0)
		{
			this.x += max.x;
		}
		while (this.x >= max.x)
		{
			this.x -= max.x;
		}
		while (this.y < 0)
		{
			this.y += max.y;
		}
		while (this.y >= max.y)
		{
			this.y -= max.y;
		}
		return this;
	}
}
