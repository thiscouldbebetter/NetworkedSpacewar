
class InputHelper
{
	constructor()
	{
		this.mousePos = new Coords();
	}

	initialize(document, display)
	{
		this.inputNamesActive = [];
		var body = document.body;
		body.onkeydown = this.handleEventKeyDown.bind(this);
		body.onkeyup = this.handleEventKeyUp.bind(this);

		var canvas = display.domElement;
		canvas.onmousedown = this.handleEventMouseDown.bind(this);
		canvas.onmousemove = this.handleEventMouseMove.bind(this);
	}

	inputAdd(inputName)
	{
		if (this.inputNamesActive[inputName] == null)
		{
			this.inputNamesActive.push(inputName);
			this.inputNamesActive[inputName] = inputName;
		}
	}

	inputRemove(inputName)
	{
		var index = this.inputNamesActive.indexOf(inputName);
		if (index >= 0)
		{
			this.inputNamesActive.splice(index, 1);
		}
		delete this.inputNamesActive[inputName];
	}

	// events

	handleEventKeyDown(event)
	{
		this.inputAdd(event.key);
	}

	handleEventKeyUp(event)
	{
		this.inputRemove(event.key);
	}

	handleEventMouseDown(event)
	{
		var canvasClientRect = event.target.getClientRects()[0];
		this.mousePos.overwriteWithDimensions
		(
			event.clientX - canvasClientRect.x,
			event.clientY - canvasClientRect.y
		);
		this.inputAdd("MouseDown");
	}

	handleEventMouseMove(event)
	{
		var canvasClientRect = event.target.getClientRects()[0];
		this.mousePos.overwriteWithDimensions
		(
			event.clientX - canvasClientRect.x,
			event.clientY - canvasClientRect.y
		);
		this.inputAdd("MouseMove");
	}

}
