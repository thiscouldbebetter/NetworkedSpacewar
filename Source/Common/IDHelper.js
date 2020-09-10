
class IDHelper
{
	constructor()
	{
		this._idNext = 0;
	}

	static Instance()
	{
		if (IDHelper._instance == null)
		{
			IDHelper._instance = new IDHelper();
		}
		return IDHelper._instance;
	}

	idNext()
	{
		return "_" + this._idNext++;
	}
}
