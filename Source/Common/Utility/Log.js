
class Log
{
	static Instance()
	{
		if (Log._instance == null)
		{
			Log._instance = new Log();
		}
		return Log._instance;
	}

	write(message)
	{
		if (Log.IsEnabled)
		{
			console.log(message);
		}
	}
}

