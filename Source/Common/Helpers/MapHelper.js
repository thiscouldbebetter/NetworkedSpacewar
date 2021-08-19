
class MapHelper
{
	static fromObject(objectToConvert)
	{
		var returnMap = new Map();

		for (var key in objectToConvert)
		{
			var value = objectToConvert[key];
			returnMap.set(key, value);
		}

		return returnMap;
	}

	static toString(map)
	{
		var mapAsObject = {};

		map.forEach
		(
			(v, k) => mapAsObject[k] = v
		);

		var returnValue = JSON.stringify(mapAsObject);

		return returnValue;
	}
}
