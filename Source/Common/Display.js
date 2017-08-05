
function Display(divID, size)
{
	this.divID = divID;
	this.size = size;

	this.colorBack = "White";
	this.colorFore = "Gray";
}

{
	Display.prototype.clear = function()
	{
		this.graphics.fillStyle = this.colorBack;
		this.graphics.fillRect(0, 0, this.size.x, this.size.y);

		this.graphics.strokeStyle = this.colorFore;
		this.graphics.strokeRect(0, 0, this.size.x, this.size.y);
	}

	Display.prototype.drawTextAtPos = function(text, drawPos)
	{
		this.graphics.fillStyle = this.colorFore;
		this.graphics.fillText
		(
			text, 
			drawPos.x, drawPos.y
		);
	}

	Display.prototype.drawWorld = function(world)
	{
		this.clear();

		var drawPos = new Coords();
		var drawPos2 = new Coords();

		for (var i = 0; i < world.bodies.length; i++)
		{
			var body = world.bodies[i];
			var bodyPos = body.pos;
			var bodyDefn = body.defn(world);
			var bodySize = bodyDefn.radius;

			this.graphics.strokeStyle = bodyDefn.color;

			drawPos.overwriteWith
			(
				bodyPos
			);

			this.drawTextAtPos(body.name, drawPos);

			this.graphics.beginPath();
			this.graphics.arc
			(
				drawPos.x, drawPos.y, // center
				bodySize, // radius
				0, Math.PI * 2 // start, stop angles
			);
			this.graphics.stroke();

			if (bodyDefn.speedMax != 0) // hack
			{
				this.graphics.beginPath();

				this.graphics.moveTo(drawPos.x, drawPos.y);

				drawPos2.overwriteWith
				(
					body.orientation
				).multiplyScalar
				(
					bodySize * 2
				).add
				(
					drawPos
				);

				this.graphics.lineTo(drawPos2.x, drawPos2.y);
	
				this.graphics.stroke();
			}
		}		
	}

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
	}
}
