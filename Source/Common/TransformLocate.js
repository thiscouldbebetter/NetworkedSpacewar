
function TransformLocate(loc)
{
	this.loc = loc;

	this.transformOrient = new TransformOrient(this.loc.orientation);
	this.transformTranslate = new TransformTranslate(this.loc.pos);
}
{
	TransformLocate.prototype.applyToPoints = function(points)
	{
		this.transformOrient.applyToPoints(points);
		this.transformTranslate.applyToPoints(points);
		return points;
	}
}