

function Log()
{}
{
	Log.IsEnabled = false;

	Log.write = function(message)
	{
		if (Log.IsEnabled == true)
		{
			console.log(message);
		}
	}
}
