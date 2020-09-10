
class Display
{
	constructor(divID, size)
	{
		this.divID = divID;
		this.size = size;

		this.colorBack = "White";
		this.colorFore = "Gray";

		this._drawPos = new Coords();
	}

	clear(colorBack)
	{
		colorBack = colorBack || this.colorBack;
		this.graphics.fillStyle = colorBack;
		this.graphics.fillRect(0, 0, this.size.x, this.size.y);

		this.graphics.strokeStyle = this.colorFore;
		this.graphics.strokeRect(0, 0, this.size.x, this.size.y);
	}

	drawCircle(center, radius, colorFill, colorBorder)
	{
		var g = this.graphics;

		g.beginPath();
		g.arc(center.x, center.y, radius, 0, Math.PI * 2);

		if (colorFill != null)
		{
			g.fillStyle = colorFill;
			g.fill();
		}
		if (colorBorder != null)
		{
			g.strokeStyle = colorBorder;
			g.stroke();
		}
	}

	drawPolygon(vertices, colorFill, colorBorder)
	{
		var g = this.graphics;

		g.beginPath();

		var vertex = vertices[0];
		g.moveTo(vertex.x, vertex.y);

		for (var i = 1; i < vertices.length; i++)
		{
			var vertex = vertices[i];
			g.lineTo(vertex.x, vertex.y);
		}
		g.closePath();

		if (colorFill != null)
		{
			g.fillStyle = colorFill;
			g.fill();
		}
		if (colorBorder != null)
		{
			g.strokeStyle = colorBorder;
			g.stroke();
		}
	}

	drawRay(vertex, orientation, length, color)
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
	}

	drawText(text, drawPos)
	{
		this.graphics.fillStyle = this.colorFore;
		this.graphics.fillText
		(
			text,
			drawPos.x, drawPos.y
		);
	}

	initialize(document)
	{
		var canvas = document.createElement("canvas");
		canvas.width = this.size.x;
		canvas.height = this.size.y;

		this.graphics = canvas.getContext("2d");

		var divDisplay = document.getElementById(this.divID);
		divDisplay.innerHTML = "";
		divDisplay.appendChild(canvas);

		this.domElement = canvas;
	}
}
