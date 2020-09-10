
class InputHelper
{
	initialize(document)
	{
		this.inputNamesActive = [];
		document.body.onkeydown = this.handleEventKeyDown.bind(this);
		document.body.onkeyup = this.handleEventKeyUp.bind(this);
	}

	// events

	handleEventKeyDown(event)
	{
		var inputName = event.key;
		if (this.inputNamesActive[inputName] == null)
		{
			this.inputNamesActive.push(inputName);
			this.inputNamesActive[inputName] = inputName;
		}
	}

	handleEventKeyUp(event)
	{
		var inputName = event.key;
		ArrayHelper.remove(this.inputNamesActive, inputName);
		delete this.inputNamesActive[inputName];
	}
}
