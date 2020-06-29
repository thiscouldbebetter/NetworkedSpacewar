
function TransformTranslate(displacement)
{
	this.displacement = displacement;
}
{
	TransformTranslate.prototype.applyToPoints = function(points)
	{
		points.forEach(point => {
			point.add(this.displacement);
		});
		return points;
	}
}