
function Display(divID, size)
{
	this.divID = divID;
	this.size = size;

	this.colorBack = "White";
	this.colorFore = "Gray";

	this._drawPos = new Coords();
}

{
	Display.prototype.clear = function()
	{
		this.graphics.fillStyle = this.colorBack;
		this.graphics.fillRect(0, 0, this.size.x, this.size.y);

		this.graphics.strokeStyle = this.colorFore;
		this.graphics.strokeRect(0, 0, this.size.x, this.size.y);
	};

	Display.prototype.drawCircle = function(center, radius, color)
	{
		var g = this.graphics;
		g.strokeStyle = color;
		g.beginPath();
		g.arc(center.x, center.y, radius, 0, Math.PI * 2);
		g.stroke();
	};

	Display.prototype.drawRay = function(vertex, orientation, length, color)
	{
		var g = this.graphics;
		g.strokeStyle = color;
		g.beginPath();
		g.moveTo(vertex.x, vertex.y);
		var drawPos =
			this._drawPos.overwriteWith
			(
				orientation
			).multiplyScalar
			(
				length
			).add
			(
				vertex
			);

		g.lineTo(drawPos.x, drawPos.y);
		g.stroke();
	};

	Display.prototype.drawText = function(text, drawPos)
	{
		this.graphics.fillStyle = this.colorFore;
		this.graphics.fillText
		(
			text,
			drawPos.x, drawPos.y
		);
	};

	Display.prototype.initialize = function(document)
	{
		var canvas = document.createElement("canvas");
		canvas.width = this.size.x;
		canvas.height = this.size.y;

		this.graphics = canvas.getContext("2d");

		var divDisplay = document.getElementById(this.divID);
		divDisplay.innerHTML = "";
		divDisplay.appendChild(canvas);

		this.domElement = canvas;
	};
}
