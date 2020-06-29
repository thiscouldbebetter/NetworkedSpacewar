
function IDHelper()
{
	// static class
}

{
	IDHelper._idNext = 0;

	IDHelper.IDNext = function()
	{
		return "_" + IDHelper._idNext++;
	};
}
