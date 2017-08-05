
function InputHelper()
{
	// do nothing
}

{
	InputHelper.prototype.initialize = function(document)
	{
		this.inputNamesActive = [];
		document.body.onkeydown = this.handleEventKeyDown.bind(this);
		document.body.onkeyup = this.handleEventKeyUp.bind(this);
	}

	// events

	InputHelper.prototype.handleEventKeyDown = function(event)
	{
		var inputName = event.key;
		if (this.inputNamesActive[inputName] == null)
		{
			this.inputNamesActive.push(inputName);
			this.inputNamesActive[inputName] = inputName;
		}
	}

	InputHelper.prototype.handleEventKeyUp = function(event)
	{
		var inputName = event.key;
		this.inputNamesActive.remove(inputName);
		delete this.inputNamesActive[inputName];
	}
}
