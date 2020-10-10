
class ArrayHelper
{
	static addLookups(array, keyName)
	{
		for (var i = 0; i < array.length; i++)
		{
			var item = array[i];
			var key = item[keyName];
			array[key] = item;
		}

		return array;
	}

	static clone(array)
	{
		var returnValues = [];

		for (var i = 0; i < array.length; i++)
		{
			var item = array[i];
			var itemCloned = item.clone();
			returnValues.push(itemCloned);
		}

		return returnValues;
	}

	static removeAt(array, indexToRemoveAt)
	{
		array.splice(indexToRemoveAt, 1);
	}

	static remove(array, itemToRemove)
	{
		if (array.indexOf(itemToRemove) >= 0)
		{
			ArrayHelper.removeAt(array, array.indexOf(itemToRemove));
		}
	}
}
