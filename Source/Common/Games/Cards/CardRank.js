
class CardRank
{
	constructor(name, symbol, value)
	{
		this.name = name;
		this.symbol = symbol;
		this.value = value;
	}

	static Instances()
	{
		if (this._instances == null)
		{
			this._instances = new CardRank_Instances();
		}

		return this._instances;
	}
}
