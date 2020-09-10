
class TransformTranslate
{
	constructor(displacement)
	{
		this.displacement = displacement;
	}

	applyToPoints(points)
	{
		points.forEach(point => {
			point.add(this.displacement);
		});
		return points;
	}
}