
function TransformOrient(orientation)
{
	this.orientation = orientation;
}
{
	TransformOrient.prototype.applyToPoints = function(points)
	{
		points.forEach(point => {
			// todo
		});
		return points;
	}
}