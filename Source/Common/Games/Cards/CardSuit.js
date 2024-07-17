
class CardSuit
{
	constructor(name, symbol, color)
	{
		this.name = name;
		this.symbol = symbol;
		this.color = color;
	}

	static Instances()
	{
		if (this._instances == null)
		{
			this._instances = new CardSuit_Instances();
		}

		return this._instances;
	}
}

